/**
 * Worker Dashboard
 * Shows nearby jobs, active jobs, and earnings overview
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi';
import axios from 'axios';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const [statsRes, jobsRes] = await Promise.all([
          axios.get('/api/users/stats'),
          axios.get(`/api/jobs/nearby?latitude=${latitude}&longitude=${longitude}&radius=10`)
        ]);

        setStats(statsRes.data.stats);
        setNearbyJobs(jobsRes.data.jobs.slice(0, 10));
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Worker Dashboard</h1>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">KES {stats.totalEarnings.toLocaleString()}</p>
                </div>
                <FiDollarSign className="text-3xl text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed Jobs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedJobs}</p>
                </div>
                <FiTrendingUp className="text-3xl text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">⭐ {stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Escrow Balance</p>
                  <p className="text-2xl font-bold text-purple-600">KES {stats.escrowBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/worker/available-jobs')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            📍 Nearby Jobs
          </button>
          <button
            onClick={() => navigate('/worker/my-bids')}
            className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            🎯 My Bids
          </button>
          <button
            onClick={() => navigate('/worker/earnings')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            💰 Earnings
          </button>
          <button
            onClick={() => navigate('/worker/verify-skills')}
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition font-semibold"
          >
            ✓ Verify Skills
          </button>
        </div>

        {/* Nearby Jobs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby Jobs</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : nearbyJobs.length > 0 ? (
            <div className="space-y-4">
              {nearbyJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/worker/job/${job._id}/bid`)}
                  className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {job.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="w-4 h-4" />
                        KES {job.budget?.max}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        job.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                        job.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.urgency}
                      </div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Bid Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No nearby jobs at the moment</p>
          )}
        </div>
      </div>
    </div>
  );
}
