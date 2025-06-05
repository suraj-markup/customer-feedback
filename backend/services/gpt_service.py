import openai
import os

class GPTService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
       
    async def generate_survey_email(self, customer_name: str, purpose_of_visit: str, branch_name: str, staff_name: str):
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                     {
                        "role": "system",
                        "content": "You are a professional customer service email generator. Do not include subject line in your response. Always end the email with 'Warm Regards,' followed by the staff name and branch name on separate lines."
                    },
                    {
                        "role": "user", 
                        "content": f"""Generate a personalized survey email for:
                        Customer: {customer_name}
                        Purpose of visit: {purpose_of_visit}
                        Branch: {branch_name}
                        Staff Name: {staff_name}
                           
                        Include a professional greeting, mention their specific visit purpose, and request feedback. Keep the email more in a funny way but professional. 
                        
                        Note: 
                        - Don't use -- em dash in the email
                        - Don't write the subject line in the email
                        - End the email with exactly this format:
                          Warm Regards,
                          
                          {staff_name}
                          {branch_name}
                        - Keep the tone friendly and engaging
                        """
                    }
                ],
                max_tokens=300
               )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating survey email: {e}")
            return f"error: {e}"
       
    async def generate_feedback_summary(self, feedback_text: str, star_rating: int):
        try:
            response = openai.chat.completions.create(
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