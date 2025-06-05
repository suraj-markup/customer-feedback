import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerForm from './Components/CustomerForm';
import FeedbackForm from './Components/FeedbackForm';
import logo from './assets/logo.png';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <nav className="bg-white flex items-center justify-between px-6 py-3 shadow-md">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Astura Logo" className="h-10 w-auto" />
          </div>
          <h1 className="text-lg font-semibold text-blue-700" style={{ fontFamily: 'Montserrat, Open Sans, Arial, sans-serif' }}>Customer Feedback System</h1>
        </nav>
        <Routes>
          <Route path="/" element={<CustomerForm />} />
          <Route path="/feedback/:token" element={<FeedbackForm />} />
        </Routes>
        <ToastContainer position="top-center" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </Router>
  );
}

export default App;