/**
 * Web App - Main Entry Point
 * React + Router setup for customer and worker interfaces
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import AuthContext from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import JobSearchPage from './pages/customer/JobSearch';
import JobCreationPage from './pages/customer/JobCreation';
import MyJobsPage from './pages/customer/MyJobs';
import JobDetailsPage from './pages/customer/JobDetails';
import BidManagementPage from './pages/customer/BidManagement';
import PaymentPage from './pages/customer/Payment';
import RatingsPage from './pages/customer/Ratings';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';
import AvailableJobsPage from './pages/worker/AvailableJobs';
import JobBiddingPage from './pages/worker/JobBidding';
import MyBidsPage from './pages/worker/MyBids';
import WorkProgressPage from './pages/worker/WorkProgress';
import EarningsDashboard from './pages/worker/EarningsDashboard';
import SkillVerificationPage from './pages/worker/SkillVerification';

// Shared Pages
import ProfilePage from './pages/profile/ProfilePage';
import RatingPage from './pages/rating/RatingPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthContext>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/customer/search"
            element={<ProtectedRoute><JobSearchPage /></ProtectedRoute>}
          />
          <Route
            path="/customer/create-job"
            element={<ProtectedRoute><JobCreationPage /></ProtectedRoute>}
          />
          <Route
            path="/customer/my-jobs"
            element={<ProtectedRoute><MyJobsPage /></ProtectedRoute>}
          />
          <Route
            path="/customer/job/:jobId"
            element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>}
          />
          <Route
            path="/customer/job/:jobId/bids"
            element={<ProtectedRoute><BidManagementPage /></ProtectedRoute>}
          />
          <Route
            path="/customer/payment/:jobId"
            element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}
          />
          <Route
            path="/customer/ratings/:jobId"
            element={<ProtectedRoute><RatingsPage /></ProtectedRoute>}
          />

          {/* Worker Routes */}
          <Route
            path="/worker/dashboard"
            element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/worker/available-jobs"
            element={<ProtectedRoute><AvailableJobsPage /></ProtectedRoute>}
          />
          <Route
            path="/worker/job/:jobId/bid"
            element={<ProtectedRoute><JobBiddingPage /></ProtectedRoute>}
          />
          <Route
            path="/worker/my-bids"
            element={<ProtectedRoute><MyBidsPage /></ProtectedRoute>}
          />
          <Route
            path="/worker/job/:jobId/progress"
            element={<ProtectedRoute><WorkProgressPage /></ProtectedRoute>}
          />
          <Route
            path="/worker/earnings"
            element={<ProtectedRoute><EarningsDashboard /></ProtectedRoute>}
          />
          <Route
            path="/worker/verify-skills"
            element={<ProtectedRoute><SkillVerificationPage /></ProtectedRoute>}
          />

          {/* Shared Routes */}
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/rate/:userId"
            element={<ProtectedRoute><RatingPage /></ProtectedRoute>}
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer position="bottom-right" />
      </BrowserRouter>
    </AuthContext>
  </React.StrictMode>
);
