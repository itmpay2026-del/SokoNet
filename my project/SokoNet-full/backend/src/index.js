/**
 * SokoNet Backend Server
 * Main entry point for the Express.js server with Socket.IO for real-time updates
 * Features: Job matching, Real-time bidding, Escrow payments, Location-based services
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const bidRoutes = require('./routes/bids');
const paymentRoutes = require('./routes/payments');
const escrowRoutes = require('./routes/escrow');
const ratingRoutes = require('./routes/ratings');
const ussdRoutes = require('./routes/ussd');
const locationRoutes = require('./routes/location');
const trustCircleRoutes = require('./routes/trustCircles');
const skillRoutes = require('./routes/skills');
const franchiseRoutes = require('./routes/franchises');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Import Socket.IO handlers
const setupSocketHandlers = require('./workers/socketHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: (process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sokonet', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Store io instance in app for use in controllers
app.set('io', io);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/trust-circles', trustCircleRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/franchises', franchiseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.IO Handlers for real-time features
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║         SokoNet Backend Server         ║
║              ${PORT} (dev)                 ║
╚════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
