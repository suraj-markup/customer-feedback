from pymongo import MongoClient
from datetime import datetime
from config import MONGODB_URL

class MongoDBService:
    def __init__(self):
        self.client = MongoClient(MONGODB_URL)
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