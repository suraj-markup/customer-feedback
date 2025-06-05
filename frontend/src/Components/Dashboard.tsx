import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  Rating,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { format } from "date-fns";
import { API_BASE_URL } from "../constants/api";

interface Customer {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  email_consent: boolean;
  purpose_of_visit: string;
  branch_name: string;
  staff_name: string;
  created_at: string;
}

interface Feedback {
  _id: string;
  customer_id: string;
  star_rating: number;
  textual_feedback: string;
  sentiment: string;
  gpt_summary: string;
  azure_file_path: string;
  created_at: string;
}

interface AzureData {
  feedback_id: string;
  customer_data: {
    name: string;
    email: string;
    purpose_of_visit: string;
    branch_name: string;
    staff_name: string;
  };
  feedback: {
    star_rating: number;
    textual_feedback: string;
    sentiment: string;
    gpt_summary: string;
  };
  metadata: {
    submission_time: string;
    survey_token: string;
  };
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  type: "azure" | "feedback";
}

const DetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  data,
  type,
}) => {
  if (!data) return null;

  const renderAzureDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Name</Typography>
          <Typography>{data.customer_data.name || "N/A"}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Email</Typography>
          <Typography>{data.customer_data.email || "N/A"}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Purpose of Visit</Typography>
          <Typography>
            {data.customer_data.purpose_of_visit || "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Branch</Typography>
          <Typography>{data.customer_data.branch_name || "N/A"}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Staff Member</Typography>
          <Typography>{data.customer_data.staff_name || "N/A"}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Feedback Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Rating</Typography>
          <Rating value={data.feedback.star_rating} readOnly />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Feedback</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Typography>
              {data.feedback.textual_feedback || "No feedback provided"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Sentiment</Typography>
          <Chip
            label={data.feedback.sentiment || "neutral"}
            color={
              data.feedback.sentiment === "positive"
                ? "success"
                : data.feedback.sentiment === "negative"
                ? "error"
                : "warning"
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">GPT Summary</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Typography>
              {data.feedback.gpt_summary || "No summary available"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Metadata
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Submission Time</Typography>
          <Typography>
            {data.metadata?.submission_time
              ? format(new Date(data.metadata.submission_time), "PPpp")
              : "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Survey Token</Typography>
          <Typography>{data.metadata?.survey_token || "N/A"}</Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const renderFeedbackDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Feedback Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Rating</Typography>
          <Rating value={data.star_rating} readOnly />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Feedback</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Typography>
              {data.textual_feedback || "No feedback provided"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Sentiment</Typography>
          <Chip
            label={data.sentiment || "neutral"}
            color={
              data.sentiment === "positive"
                ? "success"
                : data.sentiment === "negative"
                ? "error"
                : "warning"
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">GPT Summary</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Typography>
              {data.gpt_summary || "No summary available"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Azure File Path</Typography>
          <Typography>{data.azure_file_path || "N/A"}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Created At</Typography>
          <Typography>
            {data.created_at
              ? format(new Date(data.created_at), "PPpp")
              : "N/A"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {type === "azure" ? "Azure Data Details" : "Feedback Details"}
      </DialogTitle>
      <DialogContent dividers>
        {type === "azure" ? renderAzureDetails() : renderFeedbackDetails()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [azureData, setAzureData] = useState<AzureData[]>([]);
  const [activeTab, setActiveTab] = useState<
    "customers" | "feedback" | "azure"
  >("customers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"azure" | "feedback">("azure");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, feedbacksRes, azureRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/customers`),
        axios.get(`${API_BASE_URL}/api/feedback`),
        axios.get(`${API_BASE_URL}/api/azure-data`),
      ]);

      setCustomers(customersRes.data || []);
      setFeedbacks(feedbacksRes.data || []);
      setAzureData(azureRes.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderCustomersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Mobile</th>
            <th className="px-4 py-2 border">Consent</th>
            <th className="px-4 py-2 border">Purpose</th>
            <th className="px-4 py-2 border">Branch</th>
            <th className="px-4 py-2 border">Staff</th>
            <th className="px-4 py-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{customer.name}</td>
              <td className="px-4 py-2 border">{customer.email}</td>
              <td className="px-4 py-2 border">{customer.mobile}</td>
              <td className="px-4 py-2 border">
                {customer.email_consent ? "Yes" : "No"}
              </td>
              <td className="px-4 py-2 border">{customer.purpose_of_visit}</td>
              <td className="px-4 py-2 border">{customer.branch_name}</td>
              <td className="px-4 py-2 border">{customer.staff_name}</td>
              <td className="px-4 py-2 border">
                {new Date(customer.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleRowClick = (data: any, type: "azure" | "feedback") => {
    setSelectedItem(data);
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const renderAzureDataTable = () => {
    if (!azureData || azureData.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No Azure data available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Purpose</th>
              <th className="px-4 py-2 border">Branch</th>
              <th className="px-4 py-2 border">Rating</th>
              <th className="px-4 py-2 border">Feedback</th>
              <th className="px-4 py-2 border">Sentiment</th>
              <th className="px-4 py-2 border">Submission Time</th>
            </tr>
          </thead>
          <tbody>
            {azureData.map((data) => {
              if (!data || !data.customer_data || !data.feedback) {
                return null;
              }

              return (
                <tr
                  key={data.feedback_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(data, "azure")}
                >
                  <td className="px-4 py-2 border">
                    {data.customer_data.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {data.customer_data.purpose_of_visit || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {data.customer_data.branch_name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex items-center">
                      {"⭐".repeat(data.feedback.star_rating || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-2 border max-w-md truncate">
                    {data.feedback.textual_feedback || "No feedback provided"}
                  </td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded ${
                        data.feedback.sentiment === "positive"
                          ? "bg-green-100 text-green-800"
                          : data.feedback.sentiment === "negative"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {data.feedback.sentiment || "neutral"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    {data.metadata?.submission_time
                      ? format(new Date(data.metadata.submission_time), "PPpp")
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFeedbackTable = () => {
    if (!feedbacks || feedbacks.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No feedback data available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Rating</th>
              <th className="px-4 py-2 border">Feedback</th>
              <th className="px-4 py-2 border">Sentiment</th>
              <th className="px-4 py-2 border">GPT Summary</th>
              <th className="px-4 py-2 border">Azure Path</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr
                key={feedback._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(feedback, "feedback")}
              >
                <td className="px-4 py-2 border">
                  <div className="flex items-center">
                    {"⭐".repeat(feedback.star_rating)}
                  </div>
                </td>
                <td className="px-4 py-2 border max-w-md truncate">
                  {feedback.textual_feedback}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      feedback.sentiment === "positive"
                        ? "bg-green-100 text-green-800"
                        : feedback.sentiment === "negative"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {feedback.sentiment}
                  </span>
                </td>
                <td className="px-4 py-2 border max-w-md truncate">
                  {feedback.gpt_summary}
                </td>
                <td className="px-4 py-2 border max-w-md truncate">
                  {feedback.azure_file_path}
                </td>
                <td className="px-4 py-2 border">
                  {format(new Date(feedback.created_at), "PPpp")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customer Feedback Dashboard</h1>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "customers"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("customers")}
          >
            Customers
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "feedback"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("feedback")}
          >
            Feedback
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "azure"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("azure")}
          >
            Azure Data
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-4">
        {activeTab === "customers" && renderCustomersTable()}
        {activeTab === "feedback" && renderFeedbackTable()}
        {activeTab === "azure" && renderAzureDataTable()}
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        data={selectedItem}
        type={modalType}
      />
    </div>
  );
};

export default Dashboard;
