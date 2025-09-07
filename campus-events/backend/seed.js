// backend/seed.js - Generate comprehensive test data
const { runQuery, allQuery } = require('./database');

const seedData = async () => {
  console.log('🌱 Starting comprehensive data seeding...');
  
  try {
    // Clear existing data (optional)
    // await runQuery('DELETE FROM feedback');
    // await runQuery('DELETE FROM attendance');
    // await runQuery('DELETE FROM registrations');
    // await runQuery('DELETE FROM events');
    
    // Check if we already have events
    const existingEvents = await allQuery('SELECT COUNT(*) as count FROM events');
    if (existingEvents[0].count > 5) {
      console.log('✅ Data already seeded, skipping...');
      return;
    }
    
    // Sample events data
    const events = [
      {
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop covering basics of AI and ML with Python',
        event_type: 'workshop',
        event_date: '2024-09-15',
        start_time: '10:00',
        end_time: '16:00',
        venue: 'Computer Lab A',
        capacity: 50
      },
      {
        title: 'Hackathon: Code for Change',
        description: '48-hour hackathon focused on social impact solutions',
        event_type: 'hackathon',
        event_date: '2024-09-20',
        start_time: '09:00',
        end_time: '21:00',
        venue: 'Main Auditorium',
        capacity: 100
      },
      {
        title: 'Tech Talk: Future of Web Development',
        description: 'Industry expert shares insights on modern web technologies',
        event_type: 'tech_talk',
        event_date: '2024-09-10',
        start_time: '14:00',
        end_time: '16:00',
        venue: 'Seminar Hall B',
        capacity: 80
      },
      {
        title: 'Annual Tech Fest',
        description: 'Three-day technology festival with competitions and exhibitions',
        event_type: 'fest',
        event_date: '2024-10-01',
        start_time: '09:00',
        end_time: '18:00',
        venue: 'Campus Grounds',
        capacity: 200
      },
      {
        title: 'Cybersecurity Seminar',
        description: 'Understanding modern cybersecurity threats and solutions',
        event_type: 'seminar',
        event_date: '2024-09-25',
        start_time: '11:00',
        end_time: '13:00',
        venue: 'Conference Room 1',
        capacity: 40
      },
      {
        title: 'Mobile App Development Bootcamp',
        description: 'Intensive bootcamp on React Native and Flutter',
        event_type: 'workshop',
        event_date: '2024-10-05',
        start_time: '09:00',
        end_time: '17:00',
        venue: 'Innovation Lab',
        capacity: 30
      },
      {
        title: 'Startup Pitch Competition',
        description: 'Students present their startup ideas to industry judges',
        event_type: 'competition',
        event_date: '2024-10-10',
        start_time: '13:00',
        end_time: '17:00',
        venue: 'Business Incubator',
        capacity: 60
      },
      {
        title: 'Data Science Workshop',
        description: 'Learn data analysis and visualization with Python and R',
        event_type: 'workshop',
        event_date: '2024-10-15',
        start_time: '10:00',
        end_time: '15:00',
        venue: 'Analytics Lab',
        capacity: 45
      }
    ];
    
    // Insert events
    console.log('📅 Creating sample events...');
    const eventIds = [];
    
    for (const event of events) {
      const result = await runQuery(`
        INSERT INTO events (title, description, event_type, event_date, start_time, end_time, venue, capacity, college_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        event.title, event.description, event.event_type, event.event_date,
        event.start_time, event.end_time, event.venue, event.capacity, 1
      ]);
      eventIds.push(result.id);
      console.log(`✅ Created: ${event.title}`);
    }
    
    // Get all students
    const students = await allQuery('SELECT id FROM students');
    console.log(`👥 Found ${students.length} students`);
    
    // Create realistic registrations
    console.log('📝 Creating registrations...');
    const registrationIds = [];
    
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];
      const event = events[i];
      
      // Random number of registrations (60-90% of capacity)
      const registrationCount = Math.floor(event.capacity * (0.6 + Math.random() * 0.3));
      
      // Randomly select students
      const selectedStudents = students
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(registrationCount, students.length));
      
      for (const student of selectedStudents) {
        try {
          const result = await runQuery(`
            INSERT INTO registrations (student_id, event_id, status, registered_at)
            VALUES (?, ?, 'registered', datetime('now', '-' || abs(random() % 10) || ' days'))
          `, [student.id, eventId]);
          
          registrationIds.push({
            id: result.id,
            event_id: eventId,
            student_id: student.id,
            event_title: event.title
          });
        } catch (err) {
          // Skip duplicates
        }
      }
      
      console.log(`✅ ${event.title}: ${selectedStudents.length} registrations`);
    }
    
    // Create attendance records (70-85% attendance rate)
    console.log('✅ Marking attendance...');
    let attendanceCount = 0;
    
    for (const registration of registrationIds) {
      // 70-85% chance of attendance
      if (Math.random() < 0.7 + Math.random() * 0.15) {
        await runQuery(`
          INSERT INTO attendance (registration_id, check_in_time)
          VALUES (?, datetime('now', '-' || abs(random() % 5) || ' days', '+' || abs(random() % 8) || ' hours'))
        `, [registration.id]);
        attendanceCount++;
      }
    }
    
    console.log(`✅ Created ${attendanceCount} attendance records`);
    
    // Create feedback (60-80% of attendees give feedback)
    console.log('💬 Generating feedback...');
    const attendanceRecords = await allQuery(`
      SELECT a.registration_id, r.event_id, e.title
      FROM attendance a
      JOIN registrations r ON a.registration_id = r.id
      JOIN events e ON r.event_id = e.id
    `);
    
    const feedbackComments = [
      'Great event, learned a lot!',
      'Very informative and well organized.',
      'Could have been better with more hands-on activities.',
      'Excellent speaker and content.',
      'Good event but venue was too small.',
      'Amazing experience, would recommend to others.',
      'Content was too basic for my level.',
      'Perfect introduction to the topic.',
      'Well structured and engaging.',
      'Food and refreshments were great too!',
      '', // Some feedback without comments
      '',
      ''
    ];
    
    let feedbackCount = 0;
    
    for (const attendance of attendanceRecords) {
      // 60-80% chance of giving feedback
      if (Math.random() < 0.6 + Math.random() * 0.2) {
        // Rating distribution: more 4s and 5s, fewer 1s and 2s
        let rating;
        const rand = Math.random();
        if (rand < 0.1) rating = 5; // 10%
        else if (rand < 0.4) rating = 4; // 30%
        else if (rand < 0.7) rating = 3; // 30%
        else if (rand < 0.9) rating = 2; // 20%
        else rating = 1; // 10%
        
        // Adjust rating based on event type (workshops tend to get better ratings)
        if (attendance.title.toLowerCase().includes('workshop')) {
          rating = Math.min(5, rating + 1);
        }
        
        const comment = feedbackComments[Math.floor(Math.random() * feedbackComments.length)];
        
        await runQuery(`
          INSERT INTO feedback (registration_id, rating, comments, submitted_at)
          VALUES (?, ?, ?, datetime('now', '-' || abs(random() % 3) || ' days'))
        `, [attendance.registration_id, rating, comment]);
        
        feedbackCount++;
      }
    }
    
    console.log(`✅ Generated ${feedbackCount} feedback entries`);
    
    // Summary
    const summary = {
      events: eventIds.length,
      registrations: registrationIds.length,
      attendance: attendanceCount,
      feedback: feedbackCount,
      attendance_rate: ((attendanceCount / registrationIds.length) * 100).toFixed(1) + '%',
      feedback_rate: ((feedbackCount / attendanceCount) * 100).toFixed(1) + '%'
    };
    
    console.log('\n🎉 Data seeding completed successfully!');
    console.log('📊 Summary:', summary);
    console.log('\n🚀 You can now test the reports:');
    console.log('   • http://localhost:5000/api/reports/popularity');
    console.log('   • http://localhost:5000/api/reports/student-participation');
    console.log('   • http://localhost:5000/api/reports/top-students');
    console.log('   • http://localhost:5000/api/reports/dashboard');
    
    return summary;
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  const { initDB } = require('./database');
  
  // Initialize DB first
  initDB();
  
  // Wait a bit then seed
  setTimeout(() => {
    seedData().then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
  }, 2000);
}

module.exports = { seedData };