import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

const FeedbackForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [feedback, setFeedback] = useState({
    star_rating: 5,
    textual_feedback: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackTouched, setFeedbackTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCustomerInfo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/feedback/${token}`
        );
        setCustomerInfo(response.data);
      } catch (error) {
        alert("Invalid or expired survey link");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadCustomerInfo();
    }
  }, [token]);

  const validateFeedback = (text: string) => {
    if (!text.trim()) return 'Feedback is required.';
    if (text.trim().length < 10) return 'Feedback must be at least 10 characters.';
    return '';
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFeedback({ ...feedback, textual_feedback: value });
    if (feedbackTouched) {
      setFeedbackError(validateFeedback(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackTouched(true);
    const error = validateFeedback(feedback.textual_feedback);
    setFeedbackError(error);
    if (error) return;
    try {
      setSubmitting(true);
      await axios.post(`http://localhost:8000/api/feedback/${token}`, feedback);
      setSubmitted(true);
    } catch (error) {
      alert("Error submitting feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-96">
        <CircularProgress color="primary" size={48} />
        <span className="mt-4 text-blue-700 text-lg font-medium animate-fade-in">Loading feedback form...</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="w-4/6 md:w-4/6 lg:w-3/6 mx-auto mt-16 p-8 bg-white rounded-lg shadow-md flex flex-col items-center animate-fade-in">
        <svg className="h-16 w-16 text-green-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-green-700">Thank You!</h2>
        <p className="text-lg text-gray-700 text-center">Your feedback has been submitted successfully.<br/>We appreciate your input!</p>
      </div>
    );
  }

  if (!customerInfo) {
    return <div className="text-center mt-8">Invalid survey link</div>;
  }

  return (
    <div className="w-4/6 md:w-4/6 lg:w-3/6 mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Hello {customerInfo.customer_name}!
      </h2>
      <p className="mb-6">
        Thank you for visiting {customerInfo.branch_name} for{" "}
        {customerInfo.purpose_of_visit}. Please share your feedback:
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Rating:</label>
          <div className="flex items-center space-x-2">
            <Rating
              name="star-rating"
              value={feedback.star_rating}
              onChange={(_, newValue) => {
                setFeedback({ ...feedback, star_rating: newValue || 1 });
              }}
              size="large"
            />
            <span className="ml-2 text-sm text-gray-600">{feedback.star_rating}/5</span>
          </div>
        </div>

        {/* Feedback text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Feedback:
          </label>
          <textarea
            value={feedback.textual_feedback}
            onChange={handleFeedbackChange}
            onBlur={() => {
              setFeedbackTouched(true);
              setFeedbackError(validateFeedback(feedback.textual_feedback));
            }}
            maxLength={500}
            rows={4}
            className={`w-full p-2 border rounded-md ${feedbackError && feedbackTouched ? 'border-red-500' : ''}`}
            placeholder="Please share your experience..."
            required
          />
          {feedbackError && feedbackTouched ? (
            <p className="text-xs text-red-500 mt-1">{feedbackError}</p>
          ) : (
            <p className="text-sm text-gray-500">{feedback.textual_feedback.length}/500 characters</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
          disabled={!!feedbackError || !feedbackTouched || submitting}
        >
          {submitting && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
