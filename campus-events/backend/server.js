// backend/server.js
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDB();

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/students', require('./routes/students'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running!', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📈 Reports: http://localhost:${PORT}/api/reports/popularity`);
});

module.exports = app;