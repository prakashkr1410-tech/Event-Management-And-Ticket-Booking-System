# Event Management and Ticket Booking System (EMTBS)

A full-stack MERN application for browsing events, booking tickets, and managing events as an organizer — built as a B.Tech final year mini project.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose schemas, indexes, and atomic seat reservations)
- **Auth:** JWT (JSON Web Tokens), bcrypt password hashing
- **Extras:** QR code generation for e-tickets (`qrcode` package)

## Features
- User & Admin (organizer) roles with JWT authentication
- Admin: create/edit/delete events, view attendees, revenue & tickets-sold stats
- User: browse/search/filter events, book tickets, get a QR-coded e-ticket, view/cancel bookings
- Real-time seat availability tracking (prevents overbooking)
- Mock payment flow (marks bookings as paid instantly — swap in Razorpay/Stripe for production)

## Project Structure
```
event-ticketing-system/
├── backend/
│   ├── config/db.js
│   ├── models/          (User, Event, Booking)
│   ├── controllers/     (auth, event, booking logic)
│   ├── routes/          (auth, event, booking routes)
│   ├── middleware/      (JWT auth + admin guard)
│   ├── utils/generateToken.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.js
    │   ├── components/  (Navbar, EventCard, ProtectedRoute)
    │   ├── pages/        (Home, Login, Register, EventDetails,
    │   │                  MyBookings, AdminDashboard, CreateEvent)
    │   └── App.js
    └── public/index.html
```

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally, or a free MongoDB Atlas cluster

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a strong JWT_SECRET
npm run dev       # starts on http://localhost:5000
```

The API waits for the MongoDB connection before accepting requests. Booking seat counts are reserved atomically to prevent concurrent requests from overselling an event.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start          # starts on http://localhost:3000
```

The frontend expects the API at `http://localhost:5000/api` by default (see `src/api/axios.js`). To point elsewhere, create a `.env` in `frontend/` with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Try it out
1. Register once as **Event Organizer (Admin)** and once as **Attendee** (two accounts).
2. Log in as admin → create a few events from the Admin Dashboard.
3. Log in as attendee → browse/search events → book tickets → view your e-ticket with QR code under "My Bookings".

## API Endpoints

| Method | Endpoint                        | Access        | Description                     |
|--------|----------------------------------|---------------|----------------------------------|
| POST   | /api/auth/register              | Public        | Register a new user             |
| POST   | /api/auth/login                 | Public        | Login, returns JWT              |
| GET    | /api/auth/profile               | Logged in     | Get own profile                 |
| GET    | /api/events                     | Public        | List/search/filter events       |
| GET    | /api/events/:id                 | Public        | Get single event                |
| POST   | /api/events                     | Admin         | Create event                    |
| PUT    | /api/events/:id                 | Admin         | Update event                    |
| DELETE | /api/events/:id                 | Admin         | Delete event                    |
| GET    | /api/events/admin/mine          | Admin         | List own created events         |
| POST   | /api/bookings                   | Logged in     | Book tickets for an event       |
| GET    | /api/bookings/my                | Logged in     | List own bookings               |
| PUT    | /api/bookings/:id/cancel        | Logged in     | Cancel a booking                |
| GET    | /api/bookings/event/:eventId    | Admin         | List attendees for an event     |

## Suggested Enhancements (for the report / future scope)
- Real payment gateway integration (Razorpay/Stripe)
- Email confirmation via Nodemailer
- Cloudinary/Multer for banner image uploads instead of URL input
- Admin analytics charts (revenue over time, category-wise sales)
