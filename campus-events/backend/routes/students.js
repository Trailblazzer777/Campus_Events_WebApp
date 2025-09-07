// backend/routes/students.js
const express = require('express');
const { runQuery, getQuery, allQuery } = require('../database');
const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT s.*, c.name as college_name
      FROM students s
      JOIN colleges c ON s.college_id = c.id
      ORDER BY s.name ASC
    `;
    
    const students = await allQuery(sql);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT s.*, c.name as college_name
      FROM students s
      JOIN colleges c ON s.college_id = c.id
      WHERE s.id = ?
    `;
    
    const student = await getQuery(sql, [id]);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student', details: error.message });
  }
});

// Get student registrations
router.get('/:id/registrations', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT r.id, r.status, r.registered_at,
             e.id as event_id, e.title, e.event_type, e.event_date, e.start_time, e.end_time, e.venue,
             a.check_in_time, a.check_out_time,
             f.rating, f.comments, f.submitted_at
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE r.student_id = ?
      ORDER BY r.registered_at DESC
    `;
    
    const registrations = await allQuery(sql, [id]);
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student registrations', details: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const {
      student_id,
      name,
      email,
      college_id = 1,
      department,
      year
    } = req.body;
    
    // Validation
    if (!student_id || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['student_id', 'name']
      });
    }
    
    const sql = `
      INSERT INTO students (student_id, name, email, college_id, department, year)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await runQuery(sql, [
      student_id, name, email, college_id, department, year
    ]);
    
    res.status(201).json({
      message: 'Student created successfully',
      student_id: result.id,
      student: {
        id: result.id,
        student_id,
        name,
        email,
        department,
        year
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student', details: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, year } = req.body;
    
    // Check if student exists
    const student = await getQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const sql = `
      UPDATE students 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          department = COALESCE(?, department),
          year = COALESCE(?, year)
      WHERE id = ?
    `;
    
    await runQuery(sql, [name, email, department, year, id]);
    
    res.json({
      message: 'Student updated successfully',
      student_id: id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student', details: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const student = await getQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if student has registrations
    const registrations = await getQuery(
      'SELECT COUNT(*) as count FROM registrations WHERE student_id = ?',
      [id]
    );
    
    if (registrations.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete student with existing registrations',
        registrations_count: registrations.count
      });
    }
    
    await runQuery('DELETE FROM students WHERE id = ?', [id]);
    
    res.json({
      message: 'Student deleted successfully',
      student_id: id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student', details: error.message });
  }
});

module.exports = router;

