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