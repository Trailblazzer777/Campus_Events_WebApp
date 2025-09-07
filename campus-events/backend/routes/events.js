// backend/routes/events.js
const express = require('express');
const { runQuery, getQuery, allQuery } = require('../database');
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { type, college_id } = req.query;
    
    let sql = `
      SELECT e.*, c.name as college_name,
             COUNT(r.id) as registration_count
      FROM events e
      JOIN colleges c ON e.college_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'registered'
      WHERE e.is_active = 1
    `;
    const params = [];
    
    if (type) {
      sql += ' AND e.event_type = ?';
      params.push(type);
    }
    
    if (college_id) {
      sql += ' AND e.college_id = ?';
      params.push(college_id);
    }
    
    sql += ' GROUP BY e.id ORDER BY e.event_date ASC';
    
    const events = await allQuery(sql, params);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT e.*, c.name as college_name,
             COUNT(r.id) as registration_count,
             COUNT(a.id) as attendance_count,
             AVG(f.rating) as avg_rating
      FROM events e
      JOIN colleges c ON e.college_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE e.id = ?
      GROUP BY e.id
    `;
    
    const event = await getQuery(sql, [id]);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event', details: error.message });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      event_type = 'workshop',
      event_date,
      start_time,
      end_time,
      venue,
      capacity = 100,
      college_id = 1
    } = req.body;
    
    // Validation
    if (!title || !event_date || !start_time || !end_time || !venue) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'event_date', 'start_time', 'end_time', 'venue']
      });
    }
    
    const sql = `
      INSERT INTO events (title, description, event_type, event_date, start_time, end_time, venue, capacity, college_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await runQuery(sql, [
      title, description, event_type, event_date, start_time, end_time, venue, capacity, college_id
    ]);
    
    res.status(201).json({
      message: 'Event created successfully',
      event_id: result.id,
      event: {
        id: result.id,
        title,
        event_type,
        event_date,
        capacity
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

// Register student for event
router.post('/:id/register', async (req, res) => {
  try {
    const { id: event_id } = req.params;
    const { student_id } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }
    
    // Check if event exists and is active
    const event = await getQuery('SELECT * FROM events WHERE id = ? AND is_active = 1', [event_id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }
    
    // Check if student exists
    const student = await getQuery('SELECT * FROM students WHERE id = ?', [student_id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check capacity
    const regCount = await getQuery(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = "registered"',
      [event_id]
    );
    
    if (regCount.count >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check for existing registration
    const existing = await getQuery(
      'SELECT * FROM registrations WHERE student_id = ? AND event_id = ?',
      [student_id, event_id]
    );
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Student already registered',
        status: existing.status
      });
    }
    
    // Register student
    const result = await runQuery(
      'INSERT INTO registrations (student_id, event_id, status) VALUES (?, ?, ?)',
      [student_id, event_id, 'registered']
    );
    
    res.status(201).json({
      message: 'Registration successful',
      registration_id: result.id,
      student: student.name,
      event: event.title
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Mark attendance
router.post('/registrations/:reg_id/attend', async (req, res) => {
  try {
    const { reg_id } = req.params;
    
    // Check if registration exists
    const registration = await getQuery(`
      SELECT r.*, s.name as student_name, e.title as event_title
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ? AND r.status = 'registered'
    `, [reg_id]);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found or invalid' });
    }
    
    // Check if already attended
    const existing = await getQuery('SELECT * FROM attendance WHERE registration_id = ?', [reg_id]);
    if (existing) {
      return res.status(400).json({ 
        error: 'Attendance already marked',
        check_in_time: existing.check_in_time
      });
    }
    
    // Mark attendance
    await runQuery(
      'INSERT INTO attendance (registration_id, check_in_time) VALUES (?, CURRENT_TIMESTAMP)',
      [reg_id]
    );
    
    res.json({
      message: 'Attendance marked successfully',
      student: registration.student_name,
      event: registration.event_title,
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance', details: error.message });
  }
});

// Submit feedback
router.post('/registrations/:reg_id/feedback', async (req, res) => {
  try {
    const { reg_id } = req.params;
    const { rating, comments = '' } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Valid rating (1-5) is required' 
      });
    }
    
    // Check if registration exists and student attended
    const registration = await getQuery(`
      SELECT r.*, a.id as attendance_id
      FROM registrations r
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.id = ?
    `, [reg_id]);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    if (!registration.attendance_id) {
      return res.status(400).json({ error: 'Cannot submit feedback without attending event' });
    }
    
    // Check for existing feedback
    const existing = await getQuery('SELECT * FROM feedback WHERE registration_id = ?', [reg_id]);
    if (existing) {
      return res.status(400).json({ error: 'Feedback already submitted' });
    }
    
    // Submit feedback
    await runQuery(
      'INSERT INTO feedback (registration_id, rating, comments) VALUES (?, ?, ?)',
      [reg_id, rating, comments]
    );
    
    res.json({
      message: 'Feedback submitted successfully',
      rating,
      comments: comments || 'No comments'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
  }
});

// Get event registrations (for admins)
router.get('/:id/registrations', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT r.id, r.status, r.registered_at,
             s.student_id, s.name, s.email, s.department, s.year,
             a.check_in_time, a.check_out_time,
             f.rating, f.comments, f.submitted_at
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `;
    
    const registrations = await allQuery(sql, [id]);
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations', details: error.message });
  }
});

router.post('/registrations/:reg_id/checkout', async (req, res) => {
  await runQuery('UPDATE attendance SET check_out_time = CURRENT_TIMESTAMP WHERE registration_id = ?', [reg_id]);
  res.json({ message: 'Checkout marked successfully' });
});


module.exports = router;