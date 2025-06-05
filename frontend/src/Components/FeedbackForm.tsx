import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const FeedbackForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [feedback, setFeedback] = useState({
    star_rating: 5,
    textual_feedback: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/feedback/${token}`, feedback);
      setSubmitted(true);
    } catch (error) {
      alert("Error submitting feedback");
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
        Thank you for visiting {customerInfo.branch_name} for{" "}
        {customerInfo.purpose_of_visit}. Please share your feedback:
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
                onClick={() => setFeedback({ ...feedback, star_rating: star })}
                className={`text-2xl ${
                  star <= feedback.star_rating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Feedback text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Feedback:
          </label>
          <textarea
            value={feedback.textual_feedback}
            onChange={(e) =>
              setFeedback({ ...feedback, textual_feedback: e.target.value })
            }
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
