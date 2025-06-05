Voice of Customer - Developer Requirements
 Objective:
 We are building a customer feedback system to collect, process, and analyze customer experiences
 across different service branches. The system must respect customer consent and ensure secure
 and one-time-only feedback submission.
 Key Functional Requirements
 1. Customer & Staff Data Capture- A form should accept the following customer details:
  - Name
  - Email address
  - Mobile number
  - Email consent status (Yes/No)
  - Purpose of visit (e.g., new account, deposit, internet banking, mortgage enquiry, etc.)- Additionally, branch and staff details must be captured:
  - Branch ID
  - Branch name
  - Name of the staff member who served the customer
 2. Survey Email Trigger- The system must only trigger the survey email if the customer has given consent (i.e., consent =
 'Y').- The content of the survey email should be generated dynamically using GPT, addressing the
 customer by name and stating the purpose of their visit.
- This email includes a secure link to the feedback form.
 3. Feedback Form Submission- The feedback form must:
  - Allow customers to select a star rating (1 to 5).
  - Accept textual feedback (up to 500 words).
  - Prevent multiple submissions (one-time link usage).
 4. Response Handling- Once a customer submits feedback:
  - The system should analyze the sentiment (positive, neutral, negative).
  - A GPT-generated summary of the response should be created.
  - The entire feedback payload (customer data, rating, comments, sentiment, GPT summary) should
 be stored as a JSON file in Azure Data Lake.
 5. Deduplication and Link Security- Each feedback link must be one-time use. After submission, the link should expire.- If a customer attempts to reuse the same link, the system should reject it and display an
 appropriate message.
 6. Summary Table Update- After submission, the customers rating and GPT summary must be recorded in a summary table or
 structured dataset, for future reporting and analysis.
 Tech Environment Expectations- Frontend: React-based interface for input and feedback forms.
- Backend APIs:
  - Compose and send survey emails using GPT.
  - Store feedback responses securely in Azure Data Lake.
  - Generate GPT summaries of feedback.
  - Enforce link expiration and duplication check.