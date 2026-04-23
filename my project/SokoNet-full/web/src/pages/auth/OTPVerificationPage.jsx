/**
 * OTP Verification Page
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthCtx } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthCtx);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const phone = localStorage.getItem('phone');

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/api/users/verify-otp', {
        phone,
        otp
      });

      login(res.data.token);
      localStorage.removeItem('phone');
      
      // Redirect based on user type
      if (res.data.user.userType === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
      
      toast.success('Welcome to SokoNet!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter the code sent to {phone}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              6-Digit Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-center text-2xl tracking-widest font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-4 text-blue-600 py-2 font-semibold hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
