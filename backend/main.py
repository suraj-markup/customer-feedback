from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, constr
from typing import Optional
from datetime import datetime
from bson import ObjectId
import uuid
import os
from dotenv import load_dotenv
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from fastapi.requests import Request

load_dotenv()

app = FastAPI(title="Customer Feedback API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."}
    )

   # Pydantic models
class CustomerCreate(BaseModel):
    name: constr(strip_whitespace=True, min_length=2, max_length=100)
    email: EmailStr
    mobile: Optional[constr(pattern=r'^\d{10,15}$')] = None
    email_consent: bool
    purpose_of_visit: constr(strip_whitespace=True, min_length=2)
    branch_id: constr(strip_whitespace=True, min_length=1)
    branch_name: constr(strip_whitespace=True, min_length=2)
    staff_name: constr(strip_whitespace=True, min_length=2)

class FeedbackSubmission(BaseModel):
    star_rating: int = Field(..., ge=1, le=5)
    textual_feedback: constr(strip_whitespace=True, min_length=10, max_length=500)

@app.get("/")
async def root():
    return {"message": "Customer Feedback API is running!"}

@app.get("/health")
async def health_check():
   return {"status": "healthy"}

@app.get("/test-mongodb")
async def test_mongodb():
    try:
        from services.mongodb_service import mongodb_service
        result = mongodb_service.customers.find_one()
        return {"status": "MongoDB connected successfully"}
    except Exception as e:
        return {"error": str(e)}
    


@app.post("/api/customers")
@limiter.limit("10/minute")
async def create_customer(customer: CustomerCreate, request: Request):
    from services.mongodb_service import mongodb_service
    from services.gpt_service import gpt_service
    from services.email_service import email_service
    try:
        # Store customer in MongoDB
        customer_id = mongodb_service.create_customer(customer.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if customer.email_consent:
        try:
            # Generate survey token
            token = str(uuid.uuid4())
            # Store survey link
            survey_doc = {
                "customer_id": customer_id,
                "token": token,
                "is_used": False,
                "created_at": datetime.now()
            }
            mongodb_service.survey_links.insert_one(survey_doc)
            # Generate personalized email
            email_content = await gpt_service.generate_survey_email(
                customer.name, 
                customer.purpose_of_visit, 
                customer.branch_name,
                customer.staff_name
            )
            # Send email
            email_sent = await email_service.send_survey_email(
                customer.email,
                customer.name,
                token,
                email_content
            )
            return {
                "message": "Customer created and survey email sent!" if email_sent else "Customer created, email failed",
                "customer_id": customer_id,
                "survey_token": token,
                "email_sent": email_sent
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error sending survey email: {str(e)}")
    return {
        "message": "Customer created successfully!",
        "customer_id": customer_id
    }

@app.get("/api/feedback/{token}")
async def get_feedback_form(token: str):
    from services.mongodb_service import mongodb_service
       
    # Validate token
    survey_link = mongodb_service.survey_links.find_one({
        "token": token, 
        "is_used": False
    })
       
    if not survey_link:
        raise HTTPException(status_code=404, detail="Invalid or expired survey link")
       
    # Get customer info
    customer = mongodb_service.customers.find_one({
        "_id": ObjectId(survey_link["customer_id"])
    })
       
    return {
        "customer_name": customer["name"] if customer else "Valued Customer",
        "purpose_of_visit": customer.get("purpose_of_visit", ""),
        "branch_name": customer.get("branch_name", ""),
        "token": token,
        "message": "Please provide your feedback"
    }

@app.get("/test-azure")
async def test_azure():
    try:
        from services.azure_service import azure_service
        test_data = {"test": "data", "timestamp": datetime.now()}
        result = await azure_service.upload_feedback_json(test_data, "test123")
        return {"status": "Azure connected", "file_path": result}
    except Exception as e:
        return {"error": str(e)}


@app.get("/test-email")
async def test_gpt():
    try:
        from services.email_service import email_service
        email = await email_service.send_survey_email("suraj.markup@gmail.com", "John Doe", "ec3332cf-9df2-405e-957c-db21ea4f153e", "Hello, this is a test email")
        return {"status": "Email connected", "sample_email": email}
    except Exception as e:
        return {"error": str(e)} 

@app.get("/test-gpt")
async def test_gpt():
    try:
        from services.gpt_service import gpt_service
        email = await gpt_service.generate_survey_email("John Doe", "Account Opening", "Main Branch")
        return {"status": "GPT connected", "sample_email": email}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/feedback/{token}")
async def submit_feedback(token: str, feedback: FeedbackSubmission):
    from services.mongodb_service import mongodb_service
    from services.azure_service import azure_service
    from services.gpt_service import gpt_service
    try:
        # 1. Validate token
        survey_link = mongodb_service.survey_links.find_one({
            "token": token, 
            "is_used": False
        })
        if not survey_link:
            raise HTTPException(status_code=404, detail="Invalid or expired token")
        # 2. Get customer data
        customer = mongodb_service.customers.find_one({
            "_id": ObjectId(survey_link["customer_id"])
        })
        # 3. Generate GPT summary
        gpt_summary = await gpt_service.generate_feedback_summary(
            feedback.textual_feedback, 
            feedback.star_rating
        )
        # 4. Store in MongoDB (operational)
        feedback_doc = {
            **feedback.dict(),
            "customer_id": survey_link["customer_id"],
            "survey_token": token,
            "sentiment": "positive" if feedback.star_rating >= 4 else "neutral" if feedback.star_rating >= 3 else "negative",
            "gpt_summary": gpt_summary,
            "azure_file_path": "",
            "created_at": datetime.now()
        }
        result = mongodb_service.feedback.insert_one(feedback_doc)
        # 5. Create complete payload for Azure Data Lake
        complete_payload = {
            "feedback_id": str(result.inserted_id),
            "customer_data": {
                "name": customer["name"],
                "email": customer["email"],
                "purpose_of_visit": customer["purpose_of_visit"],
                "branch_name": customer["branch_name"],
                "staff_name": customer["staff_name"]
            },
            "feedback": {
                "star_rating": feedback.star_rating,
                "textual_feedback": feedback.textual_feedback,
                "sentiment": feedback_doc["sentiment"],
                "gpt_summary": gpt_summary
            },
            "metadata": {
                "submission_time": datetime.now().isoformat(),
                "survey_token": token
            }
        }
        # 6. Upload to Azure Data Lake
        azure_path = await azure_service.upload_feedback_json(
            complete_payload, 
            survey_link["customer_id"]
        )
        # 7. Update MongoDB with Azure reference
        if azure_path:
            mongodb_service.feedback.update_one(
                {"_id": result.inserted_id},
                {"$set": {"azure_file_path": azure_path}}
            )
        # 8. Mark survey link as used
        mongodb_service.survey_links.update_one(
            {"token": token},
            {"$set": {"is_used": True}}
        )
        return {
            "message": "Feedback submitted successfully!",
            "feedback_id": str(result.inserted_id),
            "azure_file_path": azure_path
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
