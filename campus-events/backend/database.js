// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

const initDB = () => {
  console.log('🔧 Initializing database tables...');
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  const tables = [
    // Colleges table
    `CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Students table
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      college_id INTEGER NOT NULL,
      department TEXT,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id)
    )`,
    
    // Events table
    `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_type TEXT NOT NULL DEFAULT 'workshop',
      event_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      venue TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 100,
      college_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id)
    )`,
    
    // Registrations table
    `CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      status TEXT DEFAULT 'registered',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, event_id),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )`,
    
    // Attendance table
    `CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_id INTEGER NOT NULL UNIQUE,
      check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      check_out_time DATETIME,
      FOREIGN KEY (registration_id) REFERENCES registrations(id)
    )`,
    
    // Feedback table
    `CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_id INTEGER NOT NULL UNIQUE,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comments TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registration_id) REFERENCES registrations(id)
    )`
  ];
  
  // Create tables sequentially
  const createTable = (index) => {
    if (index >= tables.length) {
      console.log('✅ All tables created successfully');
      seedInitialData();
      return;
    }
    
    db.run(tables[index], (err) => {
      if (err) {
        console.error(`❌ Error creating table ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Table ${index + 1} created/verified`);
      }
      createTable(index + 1);
    });
  };
  
  createTable(0);
};

// Seed initial data
const seedInitialData = () => {
  db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
    if (err) {
      console.error('Error checking colleges:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('🌱 Seeding initial data...');
      
      // Insert sample college
      db.run(
        'INSERT INTO colleges (name, code) VALUES (?, ?)',
        ['Webknot University', 'WU001'],
        function(err) {
          if (err) {
            console.error('Error seeding college:', err);
            return;
          }
          
          // Insert sample students
          const students = [
            ['STU001', 'Alice Johnson', 'alice@webknot.edu', 1, 'Computer Science', 3],
            ['STU002', 'Bob Smith', 'bob@webknot.edu', 1, 'Information Technology', 2],
            ['STU003', 'Carol Davis', 'carol@webknot.edu', 1, 'Computer Science', 4],
            ['STU004', 'David Wilson', 'david@webknot.edu', 1, 'Electronics', 3],
            ['STU005', 'Eva Brown', 'eva@webknot.edu', 1, 'Computer Science', 1]
          ];
          
          const insertStudent = (index) => {
            if (index >= students.length) {
              console.log('✅ Sample data seeded successfully');
              return;
            }
            
            const student = students[index];
            db.run(
              'INSERT INTO students (student_id, name, email, college_id, department, year) VALUES (?, ?, ?, ?, ?, ?)',
              student,
              (err) => {
                if (err) console.error('Error seeding student:', err);
                insertStudent(index + 1);
              }
            );
          };
          
          insertStudent(0);
        }
      );
    }
  });
};

// Utility functions
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = { db, initDB, runQuery, getQuery, allQuery };