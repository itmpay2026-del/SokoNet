/**
 * Socket.IO Real-Time Handlers
 * Manages WebSocket connections for live updates
 * Features: Job notifications, bid updates, payment status, work tracking
 */

const Job = require('../models/Job');
const Bid = require('../models/Bid');
const User = require('../models/User');

class SocketHandlers {
  setupHandlers(io) {
    io.on('connection', (socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`);

      // Worker joins location room for job notifications
      socket.on('worker:join-location', ({ workerId, location }) => {
        const locationRoom = `location:${location.city}`;
        socket.join(locationRoom);
        socket.join(`worker:${workerId}`);
        console.log(`[Socket] Worker ${workerId} joined ${locationRoom}`);
      });

      // Customer posts new job
      socket.on('job:posted', ({ job, nearbyWorkersCount }) => {
        const locationRoom = `location:${job.city}`;
        io.to(locationRoom).emit('job:new', {
          jobId: job._id,
          title: job.title,
          category: job.category,
          budget: job.budget,
          urgency: job.urgency,
          timestamp: new Date()
        });
        console.log(`[Socket] Job ${job._id} broadcast to ${nearbyWorkersCount} workers`);
      });

      // Worker places bid
      socket.on('bid:placed', ({ jobId, workerId, bidAmount }) => {
        io.to(`job:${jobId}`).emit('bid:received', {
          workerId,
          bidAmount,
          timestamp: new Date()
        });
        console.log(`[Socket] Bid placed on job ${jobId} by worker ${workerId}`);
      });

      // Customer accepts bid
      socket.on('bid:accepted', ({ bidId, workerId, jobId }) => {
        io.to(`worker:${workerId}`).emit('bid:accepted', {
          jobId,
          bidId,
          timestamp: new Date()
        });
        console.log(`[Socket] Bid ${bidId} accepted`);
      });

      // Job status updates
      socket.on('job:progress', ({ jobId, percentage, status, workerId }) => {
        io.to(`job:${jobId}`).emit('job:progress-update', {
          jobId,
          percentage,
          status,
          workerId,
          timestamp: new Date()
        });
        console.log(`[Socket] Job ${jobId} progress: ${percentage}%`);
      });

      // Payment milestone reached
      socket.on('payment:milestone-reached', ({ escrowId, milestone, workerId }) => {
        io.to(`worker:${workerId}`).emit('payment:milestone-released', {
          escrowId,
          milestone,
          timestamp: new Date()
        });
        console.log(`[Socket] Milestone released for escrow ${escrowId}`);
      });

      // Real-time notifications
      socket.on('notification:send', ({ userId, type, data }) => {
        io.to(`user:${userId}`).emit('notification:received', {
          type,
          data,
          timestamp: new Date()
        });
      });

      // Typing indicator for chat/messages
      socket.on('user:typing', ({ conversationId, userId, isTyping }) => {
        socket.broadcast.to(`chat:${conversationId}`).emit('user:typing', {
          userId,
          isTyping
        });
      });

      // Rating/review received
      socket.on('rating:submitted', ({ rateeId, rating, reviewer }) => {
        io.to(`user:${rateeId}`).emit('rating:received', {
          rating,
          reviewer,
          timestamp: new Date()
        });
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast new job to nearby workers
   */
  static broadcastJobToNearbyWorkers(io, job, nearbyWorkers) {
    nearbyWorkers.forEach(worker => {
      io.to(`worker:${worker._id}`).emit('job:new-nearby', {
        jobId: job._id,
        title: job.title,
        category: job.category,
        budget: job.budget,
        urgency: job.urgency,
        distance: `${Math.round(Math.random() * 10)}km away`,
        timestamp: new Date()
      });
    });
  }

  /**
   * Update bid status in real-time
   */
  static updateBidStatus(io, jobId, bids) {
    io.to(`job:${jobId}`).emit('bids:updated', {
      jobId,
      bidsCount: bids.length,
      topBid: bids[0],
      timestamp: new Date()
    });
  }

  /**
   * Push rating notification
   */
  static notifyRating(io, userId, rating) {
    io.to(`user:${userId}`).emit('rating:new', {
      rating,
      message: `You received a ${rating.overallRating}★ rating`,
      timestamp: new Date()
    });
  }
}

function setupSocketHandlers(io) {
  const handlers = new SocketHandlers();
  handlers.setupHandlers(io);
}

module.exports = setupSocketHandlers;
