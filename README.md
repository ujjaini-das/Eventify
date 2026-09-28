# Eventify 🎟️

A full-stack event management platform that allows users to discover
events, register for events, receive digital tickets, and verify
attendance using QR codes.

Organisers can create and manage events, monitor registrations, manage
attendees, and perform QR-based check-ins through an attendance
dashboard.

------------------------------------------------------------------------

## 🚀 Live Demo

**Frontend:**\
https://eventify-frontend-2vig.onrender.com

**Backend API:**\
https://eventify-1ul1.onrender.com

**GitHub Repository:**\
https://github.com/ujjaini-das/Eventify

------------------------------------------------------------------------

## ✨ Features

### 👤 Authentication & Authorization

-   User registration and login
-   JWT-based authentication
-   Protected routes
-   Role-based authorization
-   User, Organiser, and Admin roles
-   Secure password handling with bcrypt

### 📅 Event Management

-   Create events
-   Edit events
-   Delete events
-   View event details
-   Search events
-   Filter events by category
-   Pagination
-   Event capacity management
-   Remaining-seat tracking
-   Event banner/image upload

### 🎟️ Event Registration

-   Register for events
-   Cancel registration
-   Prevent duplicate registrations
-   Prevent organisers from registering for their own events
-   Automatic capacity management
-   Registration count tracking

### 🎫 Digital Tickets

-   Automatic ticket generation after registration
-   Unique ticket ID
-   Digital ticket page
-   QR code generation
-   Event and attendee information displayed on the ticket

### 📷 QR Check-in

-   QR-based ticket verification
-   Event-specific attendee verification
-   Organiser/Admin check-in
-   Duplicate check-in prevention
-   Check-in timestamp tracking

### 📊 Attendance Management

-   View registered attendees
-   Search attendees
-   Check-in status
-   Attendance statistics
-   Attendance rate
-   Registration and attendance tracking

### 🛡️ Security

-   JWT authentication
-   Role-based access control
-   Helmet security headers
-   CORS configuration
-   API rate limiting
-   Request body size limits
-   Input validation
-   MongoDB/Mongoose validation
-   Protected API routes
-   Ownership checks for organisers
-   Secure environment variables
-   Global error handling

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React.js
-   React Router
-   Axios
-   CSS

### Backend

-   Node.js
-   Express.js
-   JWT
-   bcrypt
-   Multer
-   Nodemailer

### Database

-   MongoDB
-   MongoDB Atlas
-   Mongoose

### Cloud & Deployment

-   Render
-   MongoDB Atlas
-   Cloudinary
-   GitHub

### Development Tools

-   Visual Studio Code
-   Git
-   GitHub
-   Postman

------------------------------------------------------------------------

## 🏗️ Project Structure

``` text
Eventify/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── docs/
│   └── database-design.md
│
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## 🔄 Application Flow

``` text
User
  │
  ▼
Register / Login
  │
  ▼
Browse Events
  │
  ▼
View Event Details
  │
  ▼
Register for Event
  │
  ▼
Digital Ticket Generated
  │
  ▼
QR Code Generated
  │
  ▼
Attend Event
  │
  ▼
Organiser Scans QR
  │
  ▼
Ticket Verified
  │
  ▼
Attendance Updated
```

------------------------------------------------------------------------

## 🔐 Authentication Flow

``` text
User Login
    │
    ▼
Backend validates credentials
    │
    ▼
JWT generated
    │
    ▼
JWT stored by frontend
    │
    ▼
Protected API request
    │
    ▼
JWT verification middleware
    │
    ▼
Role / authorization check
    │
    ▼
Controller
```

------------------------------------------------------------------------

## 📊 Database Models

### User

Stores user and account information.

**Main fields:** - name - email - password - role - profileImage -
createdAt - updatedAt

### Event

Stores event information.

**Main fields:** - title - description - date - time - venue -
category - capacity - registeredCount - banner - organiser - createdAt -
updatedAt

### Registration

Connects users with events.

**Main fields:** - user - event - ticketId - checkedIn - checkedInAt -
createdAt - updatedAt

A unique compound index prevents the same user from registering for the
same event multiple times.

------------------------------------------------------------------------

## 🔌 Main API Routes

### Authentication

``` text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/profile
```

### Events

``` text
GET    /api/events
POST   /api/events
PATCH  /api/events/:id
DELETE /api/events/:id
```

### Registrations

``` text
POST   /api/registrations/:id/register
DELETE /api/registrations/:id/register
GET    /api/registrations/my-events
GET    /api/registrations/:id
GET    /api/registrations/:id/registrations
GET    /api/registrations/event/:id/attendance
POST   /api/registrations/check-in
```

------------------------------------------------------------------------

## ⚙️ Local Development

### 1. Clone the repository

``` bash
git clone https://github.com/ujjaini-das/Eventify.git
cd Eventify
```

### 2. Install backend dependencies

``` bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` directory.

Example:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 4. Start the backend

``` bash
npm start
```

### 5. Install frontend dependencies

Open another terminal:

``` bash
cd frontend
npm install
```

### 6. Start the frontend

``` bash
npm run dev
```

The frontend will normally run on:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🌐 Production Deployment

Eventify is deployed using:

-   **Frontend:** Render Static Site
-   **Backend:** Render Web Service
-   **Database:** MongoDB Atlas
-   **Image Storage:** Cloudinary
-   **Source Control:** GitHub

The production frontend communicates with the deployed Express backend
API.

------------------------------------------------------------------------

## 🧪 Testing

The application was tested across the major production workflows,
including:

-   User registration
-   User login
-   Protected routes
-   Event creation
-   Event editing
-   Event deletion
-   Event search
-   Event filtering
-   Pagination
-   Event registration
-   Duplicate registration prevention
-   Capacity management
-   Digital ticket generation
-   QR code generation
-   QR check-in
-   Attendance tracking
-   Role-based authorization
-   Invalid request handling
-   API security middleware

------------------------------------------------------------------------

## 🔒 Environment Variables

Sensitive credentials are stored using environment variables and are not
committed to GitHub.

The `.env` file is excluded through `.gitignore`.

------------------------------------------------------------------------

## 📌 Future Improvements

-   Email delivery using a production email API
-   Event reminders and notifications
-   Advanced analytics
-   Calendar integration
-   Real-time notifications
-   Improved event discovery
-   Automated testing
-   Additional admin controls

------------------------------------------------------------------------

## 👩‍💻 Author

**Ujjaini Das**

Computer Science & Engineering Student

GitHub:\
https://github.com/ujjaini-das
