// backend/routes/reports.js - THE MONEY MAKER 💰
const express = require('express');
const { allQuery } = require('../database');
const router = express.Router();

// 📊 EVENT POPULARITY REPORT (Main requirement)
router.get('/popularity', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.id,
        e.title,
        e.event_type,
        e.event_date,
        e.capacity,
        c.name as college_name,
        COUNT(DISTINCT r.id) as total_registrations,
        COUNT(DISTINCT a.id) as total_attendance,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT r.id) > 0 
            THEN (CAST(COUNT(DISTINCT a.id) AS FLOAT) / COUNT(DISTINCT r.id)) * 100
            ELSE 0 
          END, 2
        ) as attendance_percentage,
        ROUND(AVG(f.rating), 2) as avg_rating,
        COUNT(DISTINCT f.id) as feedback_count
      FROM events e
      JOIN colleges c ON e.college_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE e.is_active = 1
      GROUP BY e.id, e.title, e.event_type, e.event_date, e.capacity, c.name
      ORDER BY total_registrations DESC, avg_rating DESC
    `;
    
    const results = await allQuery(sql);
    
    res.json({
      title: "Event Popularity Report",
      description: "Events ranked by registration count and engagement metrics",
      generated_at: new Date().toISOString(),
      total_events: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate popularity report', 
      details: error.message 
    });
  }
});

// 👥 STUDENT PARTICIPATION REPORT 
router.get('/student-participation', async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.id,
        s.student_id,
        s.name,
        s.department,
        s.year,
        c.name as college_name,
        COUNT(DISTINCT r.id) as events_registered,
        COUNT(DISTINCT a.id) as events_attended,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT r.id) > 0 
            THEN (CAST(COUNT(DISTINCT a.id) AS FLOAT) / COUNT(DISTINCT r.id)) * 100
            ELSE 0 
          END, 2
        ) as attendance_rate,
        ROUND(AVG(f.rating), 2) as avg_rating_given,
        COUNT(DISTINCT f.id) as feedback_submitted
      FROM students s
      JOIN colleges c ON s.college_id = c.id
      LEFT JOIN registrations r ON s.id = r.student_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      GROUP BY s.id, s.student_id, s.name, s.department, s.year, c.name
      HAVING events_registered > 0
      ORDER BY events_attended DESC, attendance_rate DESC
    `;
    
    const results = await allQuery(sql);
    
    res.json({
      title: "Student Participation Report",
      description: "Student engagement metrics across all events",
      generated_at: new Date().toISOString(),
      total_active_students: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate student participation report', 
      details: error.message 
    });
  }
});

// 🏆 TOP 3 MOST ACTIVE STUDENTS (Bonus)
router.get('/top-students', async (req, res) => {
  try {
    const limit = req.query.limit || 3;
    
    const sql = `
      SELECT 
        s.id,
        s.student_id,
        s.name,
        s.department,
        s.year,
        COUNT(DISTINCT r.id) as events_registered,
        COUNT(DISTINCT a.id) as events_attended,
        ROUND(AVG(f.rating), 2) as avg_rating_given,
        COUNT(DISTINCT f.id) as feedback_count,
        -- Engagement score calculation
        ROUND(
          (COUNT(DISTINCT a.id) * 3) + 
          (COUNT(DISTINCT f.id) * 2) + 
          (COALESCE(AVG(f.rating), 0) * 1), 2
        ) as engagement_score
      FROM students s
      LEFT JOIN registrations r ON s.id = r.student_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      GROUP BY s.id, s.student_id, s.name, s.department, s.year
      HAVING events_attended > 0
      ORDER BY engagement_score DESC, events_attended DESC
      LIMIT ?
    `;
    
    const results = await allQuery(sql, [limit]);
    
    res.json({
      title: `Top ${limit} Most Active Students`,
      description: "Students ranked by engagement score (attendance × 3 + feedback × 2 + avg_rating × 1)",
      generated_at: new Date().toISOString(),
      scoring_formula: "Engagement Score = (Events Attended × 3) + (Feedback Count × 2) + (Avg Rating × 1)",
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate top students report', 
      details: error.message 
    });
  }
});

// 📈 ATTENDANCE ANALYTICS
router.get('/attendance', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.event_type,
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT r.id) as total_registrations,
        COUNT(DISTINCT a.id) as total_attendance,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT r.id) > 0 
            THEN (CAST(COUNT(DISTINCT a.id) AS FLOAT) / COUNT(DISTINCT r.id)) * 100
            ELSE 0 
          END, 2
        ) as avg_attendance_rate,
        ROUND(AVG(f.rating), 2) as avg_rating
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE e.is_active = 1
      GROUP BY e.event_type
      ORDER BY avg_attendance_rate DESC
    `;
    
    const results = await allQuery(sql);
    
    res.json({
      title: "Attendance Analytics by Event Type",
      description: "Attendance patterns and ratings across different event types",
      generated_at: new Date().toISOString(),
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate attendance analytics', 
      details: error.message 
    });
  }
});

// 📊 FEEDBACK SUMMARY
router.get('/feedback', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.id,
        e.title,
        e.event_type,
        COUNT(f.id) as feedback_count,
        ROUND(AVG(f.rating), 2) as avg_rating,
        COUNT(CASE WHEN f.rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN f.rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN f.rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN f.rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN f.rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN f.comments IS NOT NULL AND f.comments != '' THEN 1 END) as with_comments
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE e.is_active = 1
      GROUP BY e.id, e.title, e.event_type
      HAVING feedback_count > 0
      ORDER BY avg_rating DESC, feedback_count DESC
    `;
    
    const results = await allQuery(sql);
    
    res.json({
      title: "Feedback Summary Report",
      description: "Average ratings and feedback distribution per event",
      generated_at: new Date().toISOString(),
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate feedback report', 
      details: error.message 
    });
  }
});

// 📋 FLEXIBLE REPORTS (Bonus - Filter by event type)
router.get('/flexible', async (req, res) => {
  try {
    const { 
      event_type, 
      college_id, 
      date_from, 
      date_to, 
      min_rating 
    } = req.query;
    
    let sql = `
      SELECT 
        e.id,
        e.title,
        e.event_type,
        e.event_date,
        c.name as college_name,
        COUNT(DISTINCT r.id) as registrations,
        COUNT(DISTINCT a.id) as attendance,
        ROUND(AVG(f.rating), 2) as avg_rating,
        COUNT(f.id) as feedback_count
      FROM events e
      JOIN colleges c ON e.college_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE e.is_active = 1
    `;
    
    const params = [];
    const filters = [];
    
    if (event_type) {
      sql += ' AND e.event_type = ?';
      params.push(event_type);
      filters.push(`Event Type: ${event_type}`);
    }
    
    if (college_id) {
      sql += ' AND e.college_id = ?';
      params.push(college_id);
      filters.push(`College ID: ${college_id}`);
    }
    
    if (date_from) {
      sql += ' AND e.event_date >= ?';
      params.push(date_from);
      filters.push(`From: ${date_from}`);
    }
    
    if (date_to) {
      sql += ' AND e.event_date <= ?';
      params.push(date_to);
      filters.push(`To: ${date_to}`);
    }
    
    sql += ' GROUP BY e.id, e.title, e.event_type, e.event_date, c.name';
    
    if (min_rating) {
      sql += ' HAVING avg_rating >= ?';
      params.push(parseFloat(min_rating));
      filters.push(`Min Rating: ${min_rating}`);
    }
    
    sql += ' ORDER BY e.event_date DESC';
    
    const results = await allQuery(sql, params);
    
    res.json({
      title: "Flexible Report",
      description: "Custom filtered event analysis",
      filters_applied: filters,
      generated_at: new Date().toISOString(),
      total_results: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate flexible report', 
      details: error.message 
    });
  }
});

// 🎯 DASHBOARD SUMMARY (All key metrics in one call)
router.get('/dashboard', async (req, res) => {
  try {
    // Total events
    const totalEvents = await allQuery(`
      SELECT COUNT(*) as count FROM events WHERE is_active = 1
    `);
    
    // Total students
    const totalStudents = await allQuery(`
      SELECT COUNT(*) as count FROM students
    `);
    
    // Total registrations
    const totalRegistrations = await allQuery(`
      SELECT COUNT(*) as count FROM registrations
    `);
    
    // Total attendance
    const totalAttendance = await allQuery(`
      SELECT COUNT(*) as count FROM attendance
    `);
    
    // Average rating
    const avgRating = await allQuery(`
      SELECT ROUND(AVG(rating), 2) as avg_rating FROM feedback
    `);
    
    // Most popular event type
    const popularEventType = await allQuery(`
      SELECT e.event_type, COUNT(r.id) as registrations
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.event_type
      ORDER BY registrations DESC
      LIMIT 1
    `);
    
    // Recent activity (last 5 registrations)
    const recentActivity = await allQuery(`
      SELECT s.name as student_name, e.title as event_title, r.registered_at
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 5
    `);
    
    res.json({
      title: "Campus Events Dashboard",
      generated_at: new Date().toISOString(),
      summary: {
        total_events: totalEvents[0].count,
        total_students: totalStudents[0].count,
        total_registrations: totalRegistrations[0].count,
        total_attendance: totalAttendance[0].count,
        overall_attendance_rate: totalRegistrations[0].count > 0 
          ? Math.round((totalAttendance[0].count / totalRegistrations[0].count) * 100) 
          : 0,
        average_rating: avgRating[0].avg_rating || 0,
        most_popular_event_type: popularEventType[0]?.event_type || 'N/A'
      },
      recent_activity: recentActivity
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate dashboard summary', 
      details: error.message 
    });
  }
});

module.exports = router;