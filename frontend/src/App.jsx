import React from 'react';
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import CustomerForm from './Components/CustomerForm';
   import FeedbackForm from './Components/FeedbackForm';

   function App() {
     return (
       <Router>
         <div className="min-h-screen bg-gray-100">
           <nav className="bg-blue-600 text-white p-4">
             <h1 className="text-xl font-bold">Customer Feedback System</h1>
           </nav>
           
           <Routes>
             <Route path="/" element={<CustomerForm />} />
             <Route path="/feedback/:token" element={<FeedbackForm />} />
           </Routes>
         </div>
       </Router>
     );
   }

   export default App;