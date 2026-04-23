/**
 * Customer Home/Dashboard
 * Displays quick access to services and recent jobs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBriefcase, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const res = await axios.get('/api/jobs/my-jobs');
      setRecentJobs(res.data.jobs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickCategories = [
    { icon: '🔧', label: 'Plumbing', category: 'plumbing' },
    { icon: '🧹', label: 'Cleaning', category: 'cleaning' },
    { icon: '📦', label: 'Delivery', category: 'delivery' },
    { icon: '🛠️', label: 'Handyman', category: 'handyman' },
    { icon: '✂️', label: 'Beauty', category: 'beauty' },
    { icon: '📚', label: 'Tutoring', category: 'tutoring' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to SokoNet</h1>
        <p className="text-gray-600">Find trusted service providers in your area</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/customer/search')}
          className="w-full flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition"
        >
          <FiSearch className="text-blue-600 text-xl" />
          <span className="text-gray-500">Search for services...</span>
        </button>
      </div>

      {/* Quick Categories */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickCategories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => navigate(`/customer/search?category=${cat.category}`)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-center"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Post New Job */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/customer/create-job')}
          className="w-full bg-blue-600 text-white p-6 rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center gap-3 justify-center font-semibold"
        >
          <FiBriefcase className="text-2xl" />
          Post New Job
        </button>
      </div>

      {/* Recent Jobs */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Recent Jobs</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/customer/job/${job._id}`)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      job.status === 'posted' ? 'bg-yellow-100 text-yellow-800' :
                      job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FiMapPin className="w-4 h-4" />
                    {job.city}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                    <FiTrendingUp className="w-4 h-4" />
                    KES {job.budget?.max || 'TBD'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No jobs yet. <a href="/customer/create-job" className="text-blue-600">Post one now!</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
