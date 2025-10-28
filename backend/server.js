require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import configuration
const db = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');

// Import services
const whatsappService = require('./services/whatsappService');
const schedulerService = require('./services/schedulerService');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Listen for dashboard updates
  socket.on('request-stats', async () => {
    try {
      const stats = await getSystemStats();
      socket.emit('stats-update', stats);
    } catch (error) {
      logger.error('Error fetching stats:', error);
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Helper function to get system stats
async function getSystemStats() {
  try {
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
        AVG(engagement_score) as avg_engagement
      FROM users
    `);

    const [messageStats] = await db.query(`
      SELECT 
        COUNT(*) as total_messages,
        SUM(CASE WHEN message_type = 'incoming' THEN 1 ELSE 0 END) as incoming,
        SUM(CASE WHEN message_type = 'outgoing' THEN 1 ELSE 0 END) as outgoing
      FROM messages
      WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    return {
      users: userStats[0],
      messages: messageStats[0],
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Error getting system stats:', error);
    return null;
  }
}

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing services...');

    // Test database connection
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    logger.info('✅ Database connected successfully');

    // Initialize WhatsApp service
    await whatsappService.initialize();
    logger.info('✅ WhatsApp service initialized');

    // Initialize scheduler service
    schedulerService.initializeScheduler();
    logger.info('✅ Scheduler service initialized');

    logger.info('✅ All services initialized successfully');
  } catch (error) {
    logger.error('❌ Error initializing services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, async () => {
  logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  
  // Initialize services after server starts
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await db.end();
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await db.end();
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server, io };
