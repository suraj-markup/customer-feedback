import React, { useState } from 'react';
   import axios from 'axios';

   const CustomerForm: React.FC = () => {
     const [formData, setFormData] = useState({
       name: '',
       email: '',
       mobile: '',
       email_consent: false,
       purpose_of_visit: '',
       branch_id: '',
       branch_name: '',
       staff_name: ''
     });

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       try {
         const response = await axios.post('http://localhost:8000/api/customers', formData);
         alert(`Success! Survey token: ${response.data.survey_token}`);
       } catch (error) {
         alert('Error creating customer');
       }
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
       const { name, value, type } = e.target;
       setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
       }));
     };

     return (
       <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
         <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
         <form onSubmit={handleSubmit} className="space-y-4">
           <input
             type="text"
             name="name"
             placeholder="Full Name"
             value={formData.name}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <input
             type="email"
             name="email"
             placeholder="Email Address"
             value={formData.email}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <input
             type="tel"
             name="mobile"
             placeholder="Mobile Number"
             value={formData.mobile}
             onChange={handleChange}
             className="w-full p-2 border rounded"
           />
           <select
             name="purpose_of_visit"
             value={formData.purpose_of_visit}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           >
             <option value="">Select Purpose of Visit</option>
             <option value="New Account">New Account</option>
             <option value="Deposit">Deposit</option>
             <option value="Internet Banking">Internet Banking</option>
             <option value="Mortgage Enquiry">Mortgage Enquiry</option>
             <option value="General Inquiry">General Inquiry</option>
           </select>
           <input type="text" name="branch_id" placeholder="Branch ID" value={formData.branch_id} onChange={handleChange} className="w-full p-2 border rounded" required />
           <input
             type="text"
             name="branch_name"
             placeholder="Branch Name"
             value={formData.branch_name}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <input
             type="text"
             name="staff_name"
             placeholder="Staff Member Name"
             value={formData.staff_name}
             onChange={handleChange}
             className="w-full p-2 border rounded"
             required
           />
           <label className="flex items-center space-x-2">
             <input
               type="checkbox"
               name="email_consent"
               checked={formData.email_consent}
               onChange={handleChange}
             />
             <span>I consent to receive survey email</span>
           </label>
           <button
             type="submit"
             className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
           >
             Submit
           </button>
         </form>
       </div>
     );
   };

   export default CustomerForm;