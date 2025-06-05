from azure.storage.filedatalake import DataLakeServiceClient
import json
import os
from datetime import datetime

class AzureDataLakeService:
    def __init__(self):
        try:
            connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
            if not connection_string:
                raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is not set")
            
            self.service_client = DataLakeServiceClient.from_connection_string(connection_string)
            self.file_system_name = "feedback-data"
            
            # Ensure the file system exists
            try:
                self.service_client.get_file_system_client(self.file_system_name)
            except Exception:
                # Create the file system if it doesn't exist
                self.service_client.create_file_system(self.file_system_name)
                
        except Exception as e:
            print(f"Error initializing Azure Data Lake Service: {str(e)}")
            raise
        
    async def upload_feedback_json(self, feedback_data: dict, customer_id: str):
        try:
            file_system_client = self.service_client.get_file_system_client(self.file_system_name)
            
            # Create filename with timestamp
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"feedback_{customer_id}_{timestamp}.json"
            
            # Upload file
            file_client = file_system_client.get_file_client(filename)
            file_content = json.dumps(feedback_data, indent=2, default=str)
            
            await file_client.upload_data(file_content, overwrite=True)
            
            return f"feedback-data/{filename}"
        except Exception as e:
            print(f"Azure upload error: {str(e)}")
            return None

    def get_all_feedback_files(self):
        try:
            file_system_client = self.service_client.get_file_system_client(self.file_system_name)
            files = []
            
            # Use synchronous iteration
            paths = file_system_client.get_paths()
            for path in paths:
                if path.name.endswith('.json'):
                    try:
                        file_client = file_system_client.get_file_client(path.name)
                        download = file_client.download_file()
                        content = download.readall()
                        data = json.loads(content.decode('utf-8'))
                        files.append(data)
                    except Exception as file_error:
                        print(f"Error processing file {path.name}: {str(file_error)}")
                        continue
                        
            return files
        except Exception as e:
            print(f"Error getting feedback files: {str(e)}")
            raise

# Global instance
azure_service = AzureDataLakeService()