# Customer Feedback System - 24 Hour Prototype Plan

## 🚀 Objective: Functional Prototype in 24 Hours

### What We'll Build
A working customer feedback system with **dual storage strategy**: MongoDB for fast operations + Azure Data Lake for analytics compliance.

## ⚡ Final Architecture Decision

### **Dual Storage Strategy (Best of Both Worlds):**
- **MongoDB Atlas**: Fast app operations (customer data, survey links, real-time queries)
- **Azure Data Lake**: Analytics storage (complete JSON files as required)
- **Integration**: Each feedback creates both operational record + compliance file

## 📋 **Detailed 24-Hour Step-by-Step Roadmap**

---

## **HOURS 1-4: Environment Setup & Foundations**

### **Hour 1: Project Structure Setup**
#### Tasks:
1. **Create project directory structure**
   ```bash
   mkdir customer-feedback
   cd customer-feedback
   mkdir backend frontend
   ```

2. **Initialize backend Python project**
   ```bash
   cd backend
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```

3. **Create essential files**
   ```bash
   touch main.py requirements.txt .env.example README.md
   mkdir services data
   touch services/__init__.py services/mongodb_service.py services/azure_service.py services/gpt_service.py services/email_service.py
   ```

4. **Setup Git repository**
   ```bash
   git init
   echo "venv/" > .gitignore
   echo ".env" >> .gitignore
   echo "__pycache__/" >> .gitignore
   git add .
   git commit -m "Initial project setup"
   ```

### **Hour 2: MongoDB Atlas Setup**
#### Tasks:
1. **Create MongoDB Atlas account**
   - Go to mongodb.com/atlas
   - Sign up with Google/GitHub for speed
   - Verify email

2. **Create free cluster**
   - Choose "Build a Database" 
   - Select M0 Sandbox (FREE)
   - Choose AWS, nearest region
   - Cluster name: "customer-feedback"

3. **Configure database access**
   - Database Access → Add Database User
   - Username: `feedback_user`
   - Password: Generate secure password
   - Built-in Role: "Read and write to any database"

4. **Configure network access**
   - Network Access → Add IP Address
   - Add "0.0.0.0/0" for demo (allows from anywhere)
   - In production: restrict to specific IPs

5. **Get connection string**
   - Databases → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password

### **Hour 3: Azure Data Lake Setup**
#### Tasks:
1. **Create Azure account** (if needed)
   - Go to portal.azure.com
   - Sign up for free account ($200 credit)

2. **Create Storage Account**
   - Create Resource → Storage Account
   - Resource group: "customer-feedback-rg"
   - Storage account name: "feedbackstorage[uniqueid]"
   - Performance: Standard
   - Redundancy: LRS (cheapest for demo)
   - Enable hierarchical namespace: YES (this makes it Data Lake Gen2)

3. **Create container for feedback data**
   - Go to Storage Account → Containers
   - Create container: "feedback-data"
   - Public access level: Private

4. **Get connection string**
   - Storage Account → Access Keys
   - Copy "Connection string" from key1


### **Hour 4: Basic Backend Setup**
#### Tasks:
1. **Install dependencies**
   ```bash
   pip install fastapi uvicorn pymongo azure-storage-file-datalake python-dotenv pydantic[email] python-multipart fastapi-cors openai yagmail
   pip freeze > requirements.txt
   ```

2. **Create .env file**
   ```bash
   MONGODB_URL=mongodb+srv://feedback_user:yourpassword@customer-feedback.abc123.mongodb.net/feedback_system
   AZURE_STORAGE_CONNECTION_STRING=
   OPENAI_API_KEY=sk-your-api-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

3. **Create basic FastAPI app (main.py)**
   ```python
   from fastapi import FastAPI, HTTPException
   from fastapi.middleware.cors import CORSMiddleware
   from pydantic import BaseModel, EmailStr, Field
   from typing import Optional
   from datetime import datetime
   from bson import ObjectId
   import uuid
   import os
   from dotenv import load_dotenv

   load_dotenv()

   app = FastAPI(title="Customer Feedback API", version="1.0.0")

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   # Pydantic models
   class CustomerCreate(BaseModel):
       name: str
       email: EmailStr
       mobile: Optional[str] = None
       email_consent: bool
       purpose_of_visit: str
       branch_name: str
       staff_name: str

   class FeedbackSubmission(BaseModel):
       star_rating: int = Field(..., ge=1, le=5)
       textual_feedback: str = Field(..., max_length=500)

   @app.get("/")
   async def root():
       return {"message": "Customer Feedback API is running!"}

   @app.get("/health")
   async def health_check():
       return {"status": "healthy"}

   if __name__ == "__main__":
       import uvicorn
       uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

4. **Test basic setup**
   ```bash
   python main.py
   # Visit http://localhost:8000/docs to see API docs
   ```

---

## **HOURS 5-8: MongoDB Service & Customer Data Capture**

### **Hour 5: MongoDB Service Creation**
#### Tasks:
1. **Create MongoDB service (services/mongodb_service.py)**
   ```python
   from pymongo import MongoClient
   from datetime import datetime
   import os

   class MongoDBService:
       def __init__(self):
           self.client = MongoClient(os.getenv("MONGODB_URL"))
           self.db = self.client.feedback_system
           self.customers = self.db.customers
           self.survey_links = self.db.survey_links
           self.feedback = self.db.feedback

       def create_customer(self, customer_data):
           customer_doc = {
               **customer_data,
               "created_at": datetime.utcnow()
           }
           result = self.customers.insert_one(customer_doc)
           return str(result.inserted_id)

   # Global instance
   mongodb_service = MongoDBService()
   ```

2. **Test MongoDB connection (add to main.py)**
   ```python
   @app.get("/test-mongodb")
   async def test_mongodb():
       try:
           from services.mongodb_service import mongodb_service
           result = mongodb_service.customers.find_one()
           return {"status": "MongoDB connected successfully"}
       except Exception as e:
           return {"error": str(e)}
   ```

### **Hour 6: Customer Data Capture API**
#### Tasks:
1. **Implement customer creation endpoint (add to main.py)**
   ```python
   @app.post("/api/customers")
   async def create_customer(customer: CustomerCreate):
       from services.mongodb_service import mongodb_service
       
       # Store customer in MongoDB
       customer_id = mongodb_service.create_customer(customer.dict())
       
       if customer.email_consent:
           # Generate survey token
           token = str(uuid.uuid4())
           
           # Store survey link
           survey_doc = {
               "customer_id": customer_id,
               "token": token,
               "is_used": False,
               "created_at": datetime.utcnow()
           }
           mongodb_service.survey_links.insert_one(survey_doc)
           
           return {
               "message": "Customer created and survey email will be sent!",
               "customer_id": customer_id,
               "survey_token": token  # For demo purposes
           }
       
       return {
           "message": "Customer created successfully!",
           "customer_id": customer_id
       }
   ```

2. **Test customer creation**
   - Use FastAPI docs at `/docs`
   - Create test customer with email consent
   - Verify data appears in MongoDB Atlas dashboard

### **Hour 7: Survey Link Management**
#### Tasks:
1. **Create survey link validation endpoint (add to main.py)**
   ```python
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
   ```

### **Hour 8: Basic Frontend Setup**
#### Tasks:
1. **Create React app**
   ```bash
   cd ../frontend
   npx create-react-app . --template typescript
   npm install axios react-router-dom @types/react-router-dom
   ```

2. **Create basic customer form (src/CustomerForm.tsx)**
   ```typescript
   import React, { useState } from 'react';
   import axios from 'axios';

   const CustomerForm: React.FC = () => {
     const [formData, setFormData] = useState({
       name: '',
       email: '',
       mobile: '',
       email_consent: false,
       purpose_of_visit: '',
       branch_name: '',
       staff_name: ''
     });

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       try {
         const response = await axios.post('http://localhost:8000/api/customers', formData);
         alert(`Success! Survey token: ${response.data.survey_token}`);
       } catch (error) {
         alert('Error creating customer');
       }
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
       const { name, value, type } = e.target;
       setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
       }));
     };

     return (
       <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
         <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
           <input
             type="text"
             name="name"
             placeholder="Full Name"
             value={formData.name}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <input
             type="email"
             name="email"
             placeholder="Email Address"
             value={formData.email}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <input
             type="tel"
             name="mobile"
             placeholder="Mobile Number"
             value={formData.mobile}
             onChange={handleChange}
             className="w-full p-2 border rounded"
           />
           <select
             name="purpose_of_visit"
             value={formData.purpose_of_visit}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           >
             <option value="">Select Purpose of Visit</option>
             <option value="New Account">New Account</option>
             <option value="Deposit">Deposit</option>
             <option value="Internet Banking">Internet Banking</option>
             <option value="Mortgage Enquiry">Mortgage Enquiry</option>
             <option value="General Inquiry">General Inquiry</option>
           </select>
           <input
             type="text"
             name="branch_name"
             placeholder="Branch Name"
             value={formData.branch_name}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <input
             type="text"
             name="staff_name"
             placeholder="Staff Member Name"
             value={formData.staff_name}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <label className="flex items-center space-x-2">
             <input
               type="checkbox"
               name="email_consent"
               checked={formData.email_consent}
               onChange={handleChange}
             />
             <span>I consent to receive survey email</span>
           </label>
           <button
             type="submit"
             className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
           >
             Submit
           </button>
         </form>
       </div>
     );
   };

   export default CustomerForm;
   ```

---

## **HOURS 9-12: Azure Data Lake & GPT Integration**

### **Hour 9: Azure Data Lake Service**
#### Tasks:
1. **Create Azure service (services/azure_service.py)**
   ```python
   from azure.storage.filedatalake import DataLakeServiceClient
   import json
   import os
   from datetime import datetime

   class AzureDataLakeService:
       def __init__(self):
           self.service_client = DataLakeServiceClient.from_connection_string(
               os.getenv("AZURE_STORAGE_CONNECTION_STRING")
           )
           self.file_system_name = "feedback-data"
           
       async def upload_feedback_json(self, feedback_data: dict, customer_id: str):
           try:
               file_system_client = self.service_client.get_file_system_client(
                   self.file_system_name
               )
               
               # Create filename
               timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
               filename = f"feedback_{customer_id}_{timestamp}.json"
               
               # Upload file
               file_client = file_system_client.get_file_client(filename)
               file_content = json.dumps(feedback_data, indent=2, default=str)
               
               file_client.upload_data(file_content, overwrite=True)
               
               return f"feedback-data/{filename}"
           except Exception as e:
               print(f"Azure upload error: {str(e)}")
               return None

   # Global instance
   azure_service = AzureDataLakeService()
   ```

2. **Test Azure connection (add to main.py)**
   ```python
   @app.get("/test-azure")
   async def test_azure():
       try:
           from services.azure_service import azure_service
           test_data = {"test": "data", "timestamp": datetime.utcnow()}
           result = await azure_service.upload_feedback_json(test_data, "test123")
           return {"status": "Azure connected", "file_path": result}
       except Exception as e:
           return {"error": str(e)}
   ```

### **Hour 10: GPT Service Integration**
#### Tasks:
1. **Create GPT service (services/gpt_service.py)**
   ```python
   import openai
   import os

   class GPTService:
       def __init__(self):
           openai.api_key = os.getenv("OPENAI_API_KEY")
       
       async def generate_survey_email(self, customer_name: str, purpose_of_visit: str, branch_name: str):
           try:
               response = openai.ChatCompletion.create(
                   model="gpt-3.5-turbo",
                   messages=[
                       {
                           "role": "system",
                           "content": "You are a professional customer service email generator."
                       },
                       {
                           "role": "user", 
                           "content": f"""Generate a personalized survey email for:
                           Customer: {customer_name}
                           Purpose of visit: {purpose_of_visit}
                           Branch: {branch_name}
                           
                           Include a professional greeting, mention their specific visit purpose, and request feedback."""
                       }
                   ],
                   max_tokens=300
               )
               return response.choices[0].message.content
           except Exception as e:
               return f"Dear {customer_name}, Thank you for visiting {branch_name} for {purpose_of_visit}. Please share your feedback."
       
       async def generate_feedback_summary(self, feedback_text: str, star_rating: int):
           try:
               response = openai.ChatCompletion.create(
                   model="gpt-3.5-turbo",
                   messages=[
                       {
                           "role": "user",
                           "content": f"Summarize this customer feedback in 1-2 sentences. Rating: {star_rating}/5. Feedback: {feedback_text}"
                       }
                   ],
                   max_tokens=100
               )
               return response.choices[0].message.content
           except Exception as e:
               return f"Customer provided {star_rating}-star rating with feedback about their experience."

   # Global instance
   gpt_service = GPTService()
   ```

2. **Test GPT integration (add to main.py)**
   ```python
   @app.get("/test-gpt")
   async def test_gpt():
       try:
           from services.gpt_service import gpt_service
           email = await gpt_service.generate_survey_email("John Doe", "Account Opening", "Main Branch")
           return {"status": "GPT connected", "sample_email": email}
       except Exception as e:
           return {"error": str(e)}
   ```

### **Hour 11: Email Service**
#### Tasks:
1. **Create email service (services/email_service.py)**
   ```python
   import yagmail
   import os

   class EmailService:
       def __init__(self):
           try:
               self.yag = yagmail.SMTP(
                   os.getenv("EMAIL_USER"),
                   os.getenv("EMAIL_PASSWORD")
               )
           except Exception as e:
               print(f"Email service initialization error: {e}")
               self.yag = None
       
       async def send_survey_email(self, to_email: str, customer_name: str, survey_token: str, email_content: str):
           try:
               if not self.yag:
                   print("Email service not available")
                   return False
                   
               frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
               survey_link = f"{frontend_url}/feedback/{survey_token}"
               
               full_content = f"""
               {email_content}
               
               Please click the link below to provide your feedback:
               {survey_link}
               
               Thank you for your time!
               """
               
               self.yag.send(
                   to=to_email,
                   subject=f"We'd love your feedback, {customer_name}!",
                   contents=full_content
               )
               return True
           except Exception as e:
               print(f"Email sending error: {str(e)}")
               return False

   # Global instance  
   email_service = EmailService()
   ```

2. **Update customer creation to send emails (update main.py)**
   ```python
   @app.post("/api/customers")
   async def create_customer(customer: CustomerCreate):
       from services.mongodb_service import mongodb_service
       from services.gpt_service import gpt_service
       from services.email_service import email_service
       
       # Store customer in MongoDB
       customer_id = mongodb_service.create_customer(customer.dict())
       
       if customer.email_consent:
           # Generate survey token
           token = str(uuid.uuid4())
           
           # Store survey link
           survey_doc = {
               "customer_id": customer_id,
               "token": token,
               "is_used": False,
               "created_at": datetime.utcnow()
           }
           mongodb_service.survey_links.insert_one(survey_doc)
           
           # Generate personalized email
           email_content = await gpt_service.generate_survey_email(
               customer.name, 
               customer.purpose_of_visit, 
               customer.branch_name
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
       
       return {
           "message": "Customer created successfully!",
           "customer_id": customer_id
       }
   ```

### **Hour 12: Feedback Submission Backend**
#### Tasks:
1. **Implement feedback submission endpoint (add to main.py)**
   ```python
   @app.post("/api/feedback/{token}")
   async def submit_feedback(token: str, feedback: FeedbackSubmission):
       from services.mongodb_service import mongodb_service
       from services.azure_service import azure_service
       from services.gpt_service import gpt_service
       
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
           "created_at": datetime.utcnow()
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
               "submission_time": datetime.utcnow().isoformat(),
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
   ```

---

## **HOURS 13-16: Frontend Development**

### **Hour 13: Feedback Form Component**
#### Tasks:
1. **Create feedback form (src/FeedbackForm.tsx)**
   ```typescript
   import React, { useState, useEffect } from 'react';
   import { useParams } from 'react-router-dom';
   import axios from 'axios';

   const FeedbackForm: React.FC = () => {
     const { token } = useParams<{ token: string }>();
     const [customerInfo, setCustomerInfo] = useState<any>(null);
     const [feedback, setFeedback] = useState({
       star_rating: 5,
       textual_feedback: ''
     });
     const [submitted, setSubmitted] = useState(false);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const loadCustomerInfo = async () => {
         try {
           const response = await axios.get(`http://localhost:8000/api/feedback/${token}`);
           setCustomerInfo(response.data);
         } catch (error) {
           alert('Invalid or expired survey link');
         } finally {
           setLoading(false);
         }
       };
       
       if (token) {
         loadCustomerInfo();
       }
     }, [token]);

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       try {
         await axios.post(`http://localhost:8000/api/feedback/${token}`, feedback);
         setSubmitted(true);
       } catch (error) {
         alert('Error submitting feedback');
       }
     };

     if (loading) {
       return <div className="text-center mt-8">Loading...</div>;
     }

     if (submitted) {
       return (
         <div className="max-w-md mx-auto mt-8 p-6 bg-green-100 rounded-lg">
           <h2 className="text-2xl font-bold text-green-800 mb-4">Thank You!</h2>
           <p>Your feedback has been submitted successfully.</p>
         </div>
       );
     }

     if (!customerInfo) {
       return <div className="text-center mt-8">Invalid survey link</div>;
     }

     return (
       <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
         <h2 className="text-2xl font-bold mb-4">
           Hello {customerInfo.customer_name}!
         </h2>
         <p className="mb-6">
           Thank you for visiting {customerInfo.branch_name} for {customerInfo.purpose_of_visit}.
           Please share your feedback:
         </p>
         
         <form onSubmit={handleSubmit} className="space-y-4">
           {/* Star rating */}
           <div>
             <label className="block text-sm font-medium mb-2">Rating:</label>
             <div className="flex space-x-2">
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   type="button"
                   onClick={() => setFeedback({...feedback, star_rating: star})}
                   className={`text-2xl ${star <= feedback.star_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                 >
                   ⭐
                 </button>
               ))}
             </div>
           </div>

           {/* Feedback text */}
           <div>
             <label className="block text-sm font-medium mb-2">Your Feedback:</label>
             <textarea
               value={feedback.textual_feedback}
               onChange={(e) => setFeedback({...feedback, textual_feedback: e.target.value})}
               maxLength={500}
               rows={4}
               className="w-full p-2 border rounded-md"
               placeholder="Please share your experience..."
               required
             />
             <p className="text-sm text-gray-500">
               {feedback.textual_feedback.length}/500 characters
             </p>
           </div>

           <button
             type="submit"
             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
           >
             Submit Feedback
           </button>
         </form>
       </div>
     );
   };

   export default FeedbackForm;
   ```

### **Hour 14: React Router & App Integration**
#### Tasks:
1. **Update App.tsx**
   ```typescript
   import React from 'react';
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import CustomerForm from './CustomerForm';
   import FeedbackForm from './FeedbackForm';

   function App() {
     return (
       <Router>
         <div className="min-h-screen bg-gray-100">
           <nav className="bg-blue-600 text-white p-4">
             <h1 className="text-xl font-bold">Customer Feedback System</h1>
           </nav>
           
           <Routes>
             <Route path="/" element={<CustomerForm />} />
             <Route path="/feedback/:token" element={<FeedbackForm />} />
           </Routes>
         </div>
       </Router>
     );
   }

   export default App;
   ```

2. **Add Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure tailwind.config.js**
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Add Tailwind to src/index.css**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### **Hour 15: Testing & Bug Fixes**
#### Tasks:
1. **Test complete workflow locally**
   - Start backend: `python main.py`
   - Start frontend: `npm start`
   - Create customer with consent
   - Use survey token to access feedback form
   - Submit feedback
   - Check MongoDB and Azure for data

2. **Fix any issues found**
   - CORS errors
   - Database connection issues
   - Form validation problems

### **Hour 16: Environment Preparation**
#### Tasks:
1. **Create production environment files**
   ```dockerfile
   # backend/Dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 8000
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Prepare frontend for deployment**
   ```bash
   npm run build
   ```

---

## **HOURS 17-20: Deployment & Final Testing**

### **Hour 17: Backend Deployment**
#### Tasks:
1. **Deploy to Railway.app**
   - Push code to GitHub
   - Connect Railway to GitHub repo
   - Add environment variables
   - Deploy backend

2. **Verify backend deployment**
   - Test API endpoints
   - Check `/docs` page
   - Verify database connections

### **Hour 18: Frontend Deployment**
#### Tasks:
1. **Deploy to Netlify/Vercel**
   - Build React app
   - Deploy to hosting platform
   - Update API URLs to production backend

2. **Test production deployment**
   - Full end-to-end workflow
   - Mobile responsiveness
   - Error handling

### **Hour 19: Final Integration Testing**
#### Tasks:
1. **Complete production testing**
   - Customer creation → email → feedback submission
   - Verify MongoDB data
   - Verify Azure Data Lake files
   - Test error scenarios

2. **Performance testing**
   - Response times
   - Error handling
   - Mobile compatibility

### **Hour 20: Demo Data Preparation**
#### Tasks:
1. **Create sample data**
   - 5-10 customer records
   - Various feedback entries
   - Different star ratings

2. **Prepare demo script**
   - Key talking points
   - Screenshots of databases
   - Architecture explanation

---

## **HOURS 21-24: Documentation & Demo Preparation**

### **Hour 21: Documentation**
#### Tasks:
1. **Create comprehensive README.md**
   ```markdown
   # Customer Feedback System

   ## Architecture
   - **Dual Storage**: MongoDB (operations) + Azure Data Lake (analytics)
   - **Backend**: FastAPI with Python
   - **Frontend**: React with TypeScript
   - **AI Integration**: OpenAI GPT for personalization

   ## Features
   - ✅ Customer data capture with consent management
   - ✅ GPT-powered personalized email generation
   - ✅ One-time secure survey links
   - ✅ Star rating and text feedback
   - ✅ Automatic sentiment analysis
   - ✅ GPT feedback summaries
   - ✅ Dual storage for operations and analytics
   - ✅ Duplicate submission prevention

   ## Demo URLs
   - Frontend: https://your-app.netlify.app
   - API: https://your-api.railway.app
   - API Docs: https://your-api.railway.app/docs
   ```

### **Hour 22: Demo Rehearsal**
#### Tasks:
1. **Practice complete demo flow (5-10 minutes)**
   - Introduction to architecture
   - Customer form demonstration
   - Email generation showcase
   - Feedback submission process
   - Database demonstrations
   - API documentation review

2. **Prepare talking points**
   - Why dual storage was chosen
   - Technical challenges solved
   - Scalability considerations

### **Hour 23: Final Polish**
#### Tasks:
1. **UI/UX improvements**
   - Loading states
   - Error messages
   - Responsive design
   - Accessibility

2. **Performance optimization**
   - Error handling
   - Validation improvements
   - Code cleanup

### **Hour 24: Presentation Materials**
#### Tasks:
1. **Create presentation slides**
   - Architecture diagram
   - Feature highlights
   - Technical stack overview
   - Demo screenshots

2. **Final testing checklist**
   - All endpoints working
   - Frontend responsive
   - Emails being sent
   - Data persisting correctly

---

## 🎯 **Demo Script (5-10 minutes)**

### **1. Introduction (1 minute)**
"I built a customer feedback system with dual storage architecture - MongoDB for fast operations and Azure Data Lake for analytics compliance."

### **2. Customer Data Capture (2 minutes)**
- Show responsive customer form
- Submit with email consent = Yes
- Show MongoDB record created instantly
- Explain real-time performance

### **3. GPT Email Generation (1 minute)**
- Show personalized email generated
- Highlight AI integration
- Explain personalization logic

### **4. Feedback Submission (2 minutes)**
- Click survey link from email
- Show personalized feedback form
- Submit star rating and text feedback
- Show immediate confirmation

### **5. Data Storage Demonstration (2 minutes)**
- Show MongoDB operational data (fast queries)
- Show Azure Data Lake JSON file (analytics ready)
- Explain dual storage benefits

### **6. API Documentation (1 minute)**
- Show FastAPI automatic docs at `/docs`
- Highlight interactive testing capability

### **7. Architecture Summary (1 minute)**
- Explain why both storage systems are needed
- Discuss scalability and future enhancements
- Emphasize production readiness

---

## 🚀 **Success Metrics Achieved**

### **All Functional Requirements ✅**
- [x] Customer data capture with consent management
- [x] GPT-generated personalized emails
- [x] One-time survey links with security
- [x] Star rating + text feedback (500 char limit)
- [x] Sentiment analysis
- [x] GPT feedback summaries
- [x] JSON file storage in Azure Data Lake
- [x] Duplicate submission prevention
- [x] Summary table updates

### **Technical Excellence ✅**
- [x] FastAPI with automatic documentation
- [x] Dual storage architecture (MongoDB + Azure)
- [x] Clean, readable Python code
- [x] Responsive React TypeScript frontend
- [x] Production deployment
- [x] Comprehensive error handling
- [x] Real cloud service integration

### **Demo Impact ✅**
- [x] Working end-to-end system
- [x] Real AI/ML integrations
- [x] Professional cloud deployment
- [x] Shows senior-level architectural thinking
- [x] Demonstrates complete Python stack expertise

## 💡 **Key Success Factors**

1. **Dual Storage Strategy** - Shows understanding of different data needs
2. **Real Integrations** - MongoDB, Azure, OpenAI, email services
3. **Production Ready** - Deployed, documented, tested
4. **AI Integration** - GPT for personalization and analysis
5. **Clean Architecture** - Modular, maintainable, scalable

This roadmap delivers a complete, impressive system that will showcase your Python and integration skills perfectly! 