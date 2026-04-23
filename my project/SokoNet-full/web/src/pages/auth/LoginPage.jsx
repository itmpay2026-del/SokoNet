/**
 * Login Page
 * Phone-based OTP authentication
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthCtx } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthCtx);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/users/send-otp', { phone });
      localStorage.setItem('phone', phone);
      navigate('/verify-otp');
      toast.success('OTP sent to your phone!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">SokoNet</h1>
          <p className="text-gray-600">Real-time marketplace for services</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +254)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By logging in, you agree to our</p>
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
