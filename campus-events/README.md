# Campus Events Management System

A comprehensive web application for managing campus events including hackathons, workshops, tech talks, and fests. The system provides separate portals for administrators and students with distinct functionalities.

## 🚀 Features

### Admin Portal
- **Event Management**: Create, update, and manage campus events
- **Attendance Tracking**: Mark student attendance and track participation
- **Analytics Dashboard**: View comprehensive event statistics and metrics
- **Report Generation**: Generate detailed reports on event performance
- **Student Management**: View student registrations and participation history

### Student Portal
- **Event Browsing**: Browse and discover available campus events
- **Registration**: Register for events with real-time capacity checking
- **Check-in System**: Check-in on event day for attendance tracking
- **Personal Dashboard**: Track your event participation and history
- **Feedback System**: Provide feedback and ratings for attended events

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Programming language

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JavaScript** - Server-side programming

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campus-events
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend application will start on `http://localhost:3000`

## 🎯 Usage

### Portal Selection
1. Open the application in your browser (`http://localhost:3000`)
2. Choose between **Student Portal** or **Admin Portal**
3. Navigate through the respective portal features

### Student Portal Features
- **Browse Events**: View all available campus events
- **Register**: Click on any event to register
- **Dashboard**: Track your registrations and attendance
- **Check-in**: Mark attendance on event day
- **Feedback**: Provide ratings and comments for attended events

### Admin Portal Features
- **Dashboard**: View system overview and statistics
- **Create Events**: Add new campus events with details
- **Mark Attendance**: Record student attendance for events
- **Reports**: Generate and view detailed analytics

## 📊 Database Schema

The system uses SQLite with the following main tables:
- **students**: Student information and profiles
- **events**: Event details and metadata
- **registrations**: Student event registrations
- **attendance**: Attendance tracking records
- **feedback**: Student feedback and ratings

## 🔧 API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Admin)
- `GET /api/events/:id` - Get specific event

### Registration
- `POST /api/events/:id/register` - Register for event
- `GET /api/students/:id/registrations` - Get student registrations

### Attendance
- `POST /api/attendance/mark` - Mark attendance (Admin)
- `GET /api/attendance/event/:id` - Get event attendance

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/event/:id` - Get event feedback

### Reports
- `GET /api/reports/dashboard` - Get dashboard summary
- `GET /api/reports/events` - Get event reports

## 🏗️ Project Structure

```
campus-events/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Main application pages
│   │   ├── services/            # API service functions
│   │   └── App.js              # Main application component
│   └── package.json
├── backend/
│   ├── routes/                 # API route handlers
│   ├── models/                  # Database models
│   ├── utils/                   # Utility functions
│   ├── database.js             # Database configuration
│   ├── server.js              # Server entry point
│   └── package.json
├── docs/
│   └── design-document.md       # Comprehensive design documentation
└── README.md
```

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Portal Selection**: Beautiful landing page for choosing between portals
- **Real-time Updates**: Dynamic content updates without page refresh
- **Interactive Components**: Hover effects, transitions, and animations

## 🔒 Security Considerations

- Input validation on all API endpoints
- SQL injection prevention through parameterized queries
- CORS configuration for cross-origin requests
- Error handling with user-friendly messages

## 🧪 Testing

The application includes comprehensive error handling and validation:
- Form validation for event creation
- Capacity checking for registrations
- Duplicate registration prevention
- Attendance validation
- Feedback submission validation

## 📈 Future Enhancements

- User authentication and authorization
- Email notifications for events
- Calendar integration
- Mobile app development
- Advanced analytics and reporting
- Multi-college support
- Event categories and tags
- Social features and event sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Vinay R**  
Webknot Technologies

## 📞 Support

For support and questions, please contact:
- Email: [your-email@example.com]
- GitHub Issues: [Create an issue](https://github.com/yourusername/campus-events/issues)

---

**Made with ❤️ for campus event management**
