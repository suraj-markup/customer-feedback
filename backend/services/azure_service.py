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
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
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