# Campus Events Management System

This is a web application I built for managing campus events like workshops, hackathons, and tech talks. It has two main parts - one for students to browse and register for events, and another for admins to create events and track attendance.

## What I Built

I created this system because I wanted to solve the problem of managing campus events efficiently. Students can easily find and register for events, while admins can create events and see who's attending.

The app has:
- A landing page where you choose between Student or Admin portal
- Student portal: Browse events, register, check-in, give feedback
- Admin portal: Create events, mark attendance, view reports

## Tech Stack

I used:
- **Frontend**: React with Tailwind CSS for styling
- **Backend**: Node.js with Express
- **Database**: SQLite (simple and lightweight)

## How to Run

First, make sure you have Node.js installed on your computer.

### Start the Backend
```bash
cd backend
npm install
npm start
```
This will start the server on http://localhost:5000

### Start the Frontend
```bash
cd frontend
npm install
npm start
```
This will open the app in your browser at http://localhost:3000

## How to Use

1. Open http://localhost:3000 in your browser
2. Choose "Student Portal" or "Admin Portal"
3. If you're a student: Browse events and register for ones you like
4. If you're an admin: Create new events and mark attendance

## Project Structure

```
campus-events/
├── frontend/          # React app
├── backend/           # Node.js server
├── docs/              # Design document
└── README.md
```

## What I Learned

Building this project helped me understand:
- How to create separate user interfaces for different user types
- Database design and SQL queries
- API development with Express
- React state management
- How to handle user interactions and form submissions

## Challenges I Faced

- Making sure students can't register for the same event twice
- Handling cases where events get cancelled
- Creating a clean interface that works on both desktop and mobile
- Managing attendance tracking properly

## Future Improvements

I'd like to add:
- User login system
- Email notifications
- Better mobile experience
- More detailed analytics

---

**Built by Vinay R**  
*This was a great learning experience for me!*
