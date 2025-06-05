# Customer Feedback System

A modern, AI-powered customer feedback system that collects, processes, and analyzes customer experiences across different service branches. The system ensures secure, one-time-only feedback submission while maintaining compliance and analytics capabilities.
![image](https://github.com/user-attachments/assets/93d17184-df3a-47f6-8ca6-6f20c7c432d6)


## 🎯 Project Overview

This system implements a dual-storage architecture to optimize both operational performance and analytics capabilities:
- **MongoDB Atlas**: Handles fast operational queries and real-time features
- **Azure Data Lake**: Stores complete feedback data for analytics and compliance

## ✨ Key Features

- **Customer Data Capture**
  - Name, email, mobile number collection
  - Email consent management
  - Purpose of visit tracking
  - Branch and staff details recording

- **AI-Powered Survey Emails**
  - GPT-generated personalized email content
  - Secure, one-time-use survey links
  - Dynamic content based on visit purpose

- **Feedback Collection**
  - 1-5 star rating system
  - Textual feedback (up to 500 words)
  - One-time submission enforcement
  - Duplicate prevention

- **Advanced Analytics**
  - Automatic sentiment analysis
  - GPT-generated feedback summaries
  - Dual storage for operations and analytics
  - Compliance-ready data structure

## 🏗️ Technical Architecture

### Backend Stack
- **Framework**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Storage**: Azure Data Lake Gen2
- **AI Integration**: OpenAI GPT
- **Email Service**: Yagmail

### Frontend Stack
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 16+
- MongoDB Atlas account
- Azure account with Data Lake Gen2
- OpenAI API key
- Email service credentials

### Backend Setup
```bash
# Clone the repository
git clone [repository-url]
cd customer-feedback/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the server
python main.py
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📝 Environment Variables

Create a `.env` file in the backend directory with:

```env
MONGODB_URL=mongodb+srv://[username]:[password]@[cluster].mongodb.net/feedback_system
AZURE_STORAGE_CONNECTION_STRING=[your-azure-connection-string]
OPENAI_API_KEY=[your-openai-api-key]
EMAIL_USER=[your-email@gmail.com]
EMAIL_PASSWORD=[your-app-password]
FRONTEND_URL=http://localhost:3000
```

## 🔄 System Flow

1. **Customer Data Entry**
   - Staff enters customer details
   - System captures consent status
   - Generates unique survey token

2. **Survey Email**
   - GPT generates personalized email
   - System sends secure survey link
   - Link is one-time use only

3. **Feedback Collection**
   - Customer rates experience (1-5 stars)
   - Provides textual feedback
   - System prevents duplicate submissions

4. **Data Processing**
   - Sentiment analysis performed
   - GPT generates feedback summary
   - Data stored in both MongoDB and Azure

## 📊 Data Storage Strategy

### MongoDB (Operational Data)
- Fast query performance
- Real-time operations
- Customer data
- Survey tokens
- Feedback summaries

### Azure Data Lake (Analytics)
- Complete feedback payloads
- Historical data
- Compliance storage
- Analytics-ready JSON files

## 🔒 Security Features

- One-time survey links
- Email consent management
- Secure data storage
- No duplicate submissions
- Protected API endpoints

## 📈 Performance Metrics

- **Response Times**
  - API endpoints: < 100ms
  - Database queries: < 10ms
  - File operations: < 200ms

- **Storage Efficiency**
  - MongoDB: Optimized for operations
  - Azure: Cost-effective for analytics


## Dashboard Details

The dashboard provides a comprehensive view of customer data, feedback, and Azure Data Lake information through an intuitive tabbed interface:
![image](https://github.com/user-attachments/assets/d2bf3721-9724-413d-ae5b-0a8c7029c576)
![image](https://github.com/user-attachments/assets/eaec18af-0c05-4505-aa98-57a1835e504d)


### Features

1. **Tabbed Navigation**
   - Customers Tab: View all customer records
   - Feedback Tab: Access customer feedback entries
   - Azure Data Tab: Monitor Azure Data Lake files

2. **Interactive Tables**
   - Sortable columns
   - Responsive design
   - Hover effects for better UX
   - Clickable rows for detailed views

3. **Detailed Modal Views**
   - Customer Information
     - Name, Email, Purpose of Visit
     - Branch and Staff details
     - Visit timestamps
   - Feedback Details
     - Star ratings with visual representation
     - Textual feedback in formatted cards
     - Sentiment analysis with color-coded chips
     - GPT-generated summaries
   - Azure Data Information
     - File metadata
     - Submission timestamps
     - Survey tokens
     - Associated customer data

4. **Data Visualization**
   - Color-coded sentiment indicators
   - Star rating visualization
   - Formatted timestamps
   - Truncated text with full view in modals

5. **Real-time Updates**
   - Automatic data refresh
   - Loading states
   - Error handling
   - Empty state messages

6. **Responsive Design**
   - Mobile-friendly layout
   - Adaptive grid system
   - Scrollable tables
   - Modal dialogs for detailed views

### Technical Implementation

- Built with React and TypeScript
- Material-UI components for consistent design
- Axios for API communication
- Date-fns for timestamp formatting
- Responsive grid system for layout
- Error boundary implementation
- Loading state management
- Type-safe props and state management 

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT integration
- MongoDB Atlas for database services
- Azure for data lake storage
- FastAPI for backend framework
- React team for frontend framework
