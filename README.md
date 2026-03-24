# Mixify - Audio Mixing Platform

A modern social audio mixing platform for creating ad-libbed soundtracks.

## 📋 Project Structure

```
Mixify/
├── backend/              # Express.js + MongoDB API
│   ├── models/          # Database schemas (User, Mix, MixShare)
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth and ownership checks
│   ├── tests/           # Unit tests
│   ├── uploads/         # Audio file storage
│   ├── server.js        # Express app
│   ├── package.json
│   └── .env.example
└── frontend/            # React + Vite (Phase 3)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 5.0+ (local or remote)
- npm or yarn

### Setup Instructions

1. **Clone and navigate to project:**
   ```bash
   cd /home/jomir/projects/audio-mixer/Mixify
   ```

2. **Install dependencies:**
   ```bash
   npm run setup
   ```

3. **Create .env file in backend directory:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Update with your MongoDB URI and secret:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mixify
   SECRET=your-secret-key-here
   PORT=3000
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Start backend server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   Server runs on `http://localhost:3000`

## 📄 License

ISC
