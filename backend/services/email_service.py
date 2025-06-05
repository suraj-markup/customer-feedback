import yagmail
import os

class EmailService:
    def __init__(self):
        email_user = os.getenv("EMAIL_USER")
        email_password = os.getenv("EMAIL_PASSWORD")
        
        if not email_user or not email_password:
            print("Email service error: EMAIL_USER or EMAIL_PASSWORD environment variables not set")
            self.yag = None
            return
            
        try:
            self.yag = yagmail.SMTP(
                email_user,
                email_password
            )
            print("Email service initialized successfully")
        except Exception as e:
            print(f"Email service initialization error: {e}")
            print("Note: For Gmail, you need to:")
            print("1. Enable 2-factor authentication")
            print("2. Generate an App Password (not your regular password)")
            print("3. Use the App Password in EMAIL_PASSWORD environment variable")
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