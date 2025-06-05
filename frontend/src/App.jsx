import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomerForm from './Components/CustomerForm';
import FeedbackForm from './Components/FeedbackForm';
import Dashboard from './Components/Dashboard';
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
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Customer Form</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<CustomerForm />} />
          <Route path="/feedback/:token" element={<FeedbackForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        <ToastContainer 
          position="top-center" 
          autoClose={4000} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
      </div>
    </Router>
  );
}

export default App;