import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../constants/api';

const initialTouched = {
  name: false,
  email: false,
  mobile: false,
  email_consent: false,
  purpose_of_visit: false,
  branch_id: false,
  branch_name: false,
  staff_name: false
};

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
  const [touched, setTouched] = useState(initialTouched);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    purpose_of_visit: '',
    branch_id: '',
    branch_name: '',
    staff_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [customPurpose, setCustomPurpose] = useState('');

  const validate = (field: string, value: string) => {
    switch (field) {
      case 'name':
        return value.trim() ? '' : 'Name is required.';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        // Simple email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.';
      case 'mobile':
        if (!value.trim()) return 'Mobile number is required.';
        // Simple mobile regex (10-15 digits)
        return /^\d{10,15}$/.test(value) ? '' : 'Enter a valid mobile number (10-15 digits).';
      case 'purpose_of_visit':
        if (value === 'Others') return customPurpose.trim() ? '' : 'Please specify your purpose.';
        return value ? '' : 'Purpose of visit is required.';
      case 'branch_id':
        return value.trim() ? '' : 'Branch ID is required.';
      case 'branch_name':
        return value.trim() ? '' : 'Branch name is required.';
      case 'staff_name':
        return value.trim() ? '' : 'Staff member name is required.';
      default:
        return '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (name !== 'email_consent') {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    if (name === 'purpose_of_visit') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (touched.purpose_of_visit) {
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
      }
      if (value !== 'Others') setCustomPurpose('');
    } else if (name === 'custom_purpose') {
      setCustomPurpose(value);
      if (touched.purpose_of_visit) {
        setErrors(prev => ({ ...prev, purpose_of_visit: value.trim() ? '' : 'Please specify your purpose.' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: fieldValue }));
      if (name !== 'email_consent' && touched[name as keyof typeof touched]) {
        setErrors(prev => ({ ...prev, [name]: validate(name, fieldValue as string) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields except email_consent (boolean)
    const newErrors: any = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'email_consent') {
        if (key === 'purpose_of_visit' && formData.purpose_of_visit === 'Others') {
          newErrors[key] = customPurpose.trim() ? '' : 'Please specify your purpose.';
        } else {
          newErrors[key] = validate(key, (formData as any)[key] as string);
        }
      }
    });
    setErrors(newErrors);
    setTouched({ ...initialTouched, ...Object.fromEntries(Object.keys(formData).filter(k => k !== 'email_consent').map(k => [k, true])) });
    if (Object.values(newErrors).some(error => error)) return;
    try {
      setLoading(true);
      const payload = {
        ...formData,
        purpose_of_visit: formData.purpose_of_visit === 'Others' ? customPurpose : formData.purpose_of_visit
      };
      const response = await axios.post(`${API_BASE_URL}/api/customers`, payload);
      setConsent(formData.email_consent);
      setSubmitted(true);
    } catch (error: any) {
      let message = 'Error creating customer';
      if (error.response && error.response.data && error.response.data.detail) {
        message = error.response.data.detail;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-4/6 md:w-4/6 lg:w-3/6 mx-auto mt-16 p-8 bg-white rounded-lg shadow-md flex flex-col items-center animate-fade-in">
        <svg className="h-16 w-16 text-green-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-green-700">Thank You!</h2>
        {consent ? (
          <p className="text-lg text-gray-700 text-center">Your information was submitted successfully.<br/>Please <span className='text-blue-500 font-bold'>check your email</span> and fill out the feedback form.</p>
        ) : (
          <p className="text-lg text-gray-700 text-center">Your information was submitted successfully.<br/>Thank you for visiting, you can close the page now.</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-4/6 md:w-4/6 lg:w-3/6 mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          <div>
            <label htmlFor="name" className="text-xs font-medium bg-white text-gray-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded ${errors.name && touched.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && touched.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="branch_id" className="text-xs font-medium text-gray-600">
              Branch ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branch_id"
              name="branch_id"
              placeholder="Branch ID"
              value={formData.branch_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded ${errors.branch_id && touched.branch_id ? 'border-red-500' : ''}`}
              required
            />
            {errors.branch_id && touched.branch_id && <p className="text-xs text-red-500 mt-1">{errors.branch_id}</p>}
          </div>
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          <div>
            <label htmlFor="mobile" className="text-xs font-medium text-gray-600">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded ${errors.mobile && touched.mobile ? 'border-red-500' : ''}`}
              required
            />
            {errors.mobile && touched.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
          </div>
          <div>
          <label htmlFor="staff_name" className="text-xs font-medium text-gray-600">
            Staff Member Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="staff_name"
            name="staff_name"
            placeholder="Staff Member Name"
            value={formData.staff_name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border rounded ${errors.staff_name && touched.staff_name ? 'border-red-500' : ''}`}
            required
          />
          {errors.staff_name && touched.staff_name && <p className="text-xs text-red-500 mt-1">{errors.staff_name}</p>}
        </div>
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
        <div>
            <label htmlFor="email" className="text-xs font-medium text-gray-600">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded ${errors.email && touched.email ? 'border-red-500' : ''}`}
              required
            />
            {errors.email && touched.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="branch_name" className="text-xs font-medium text-gray-600">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branch_name"
              name="branch_name"
              placeholder="Branch Name"
              value={formData.branch_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded ${errors.branch_name && touched.branch_name ? 'border-red-500' : ''}`}
              required
            />
            {errors.branch_name && touched.branch_name && <p className="text-xs text-red-500 mt-1">{errors.branch_name}</p>}
          </div>
        </div>
        <div className="mb-4">
            <label htmlFor="purpose_of_visit" className="text-xs font-medium text-gray-600">
              Purpose of Visit <span className="text-red-500">*</span>
            </label>
            <select
              id="purpose_of_visit"
              name="purpose_of_visit"
              value={formData.purpose_of_visit}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded ${errors.purpose_of_visit && touched.purpose_of_visit ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select Purpose of Visit</option>
              <option value="New Account">New Account</option>
              <option value="Deposit">Deposit</option>
              <option value="Internet Banking">Internet Banking</option>
              <option value="Mortgage Enquiry">Mortgage Enquiry</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Others">Others</option>
            </select>
            {formData.purpose_of_visit === 'Others' && (
              <input
                type="text"
                name="custom_purpose"
                placeholder="Please specify your purpose"
                value={customPurpose}
                onChange={handleChange}
                className={`w-full p-2 border rounded mt-2 ${errors.purpose_of_visit && touched.purpose_of_visit ? 'border-red-500' : ''}`}
                required
              />
            )}
            {errors.purpose_of_visit && touched.purpose_of_visit && <p className="text-xs text-red-500 mt-1">{errors.purpose_of_visit}</p>}
          </div>
        
        <label className="flex items-center space-x-2 ">
          <input
            type="checkbox"
            name="email_consent"
            checked={formData.email_consent}
            onChange={handleChange}
          />
          <span className='text-xs'>I consent to receive survey email</span>
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2 flex items-center justify-center"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;