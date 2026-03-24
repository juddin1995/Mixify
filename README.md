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

## 📚 API Documentation - Phase 1

### Authentication
**Base URL:** `http://localhost:3000/api`

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-24T...",
    "updatedAt": "2024-03-24T..."
  },
  "token": "eyJhbGc..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):** Same as signup

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### Mix Management

All Mix endpoints require authentication. Include token in header:
```
Authorization: Bearer <your_token>
```

#### Create Mix
```http
POST /mixes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Mix",
  "description": "Recording vocals over backing track",
  "backingTrackFile": "backing_tracks/song1.mp3",
  "backingTrackName": "Song 1 - 120 BPM",
  "recordingFile": "recordings/user123_recording.wav",
  "mixedAudioFile": "mixes/mix_12345.mp3",
  "duration": 180,
  "backingTrackVolume": 1.0,
  "recordingVolume": 1.0,
  "clientSideMix": false,
  "tags": ["pop", "acoustic"],
  "genre": "Pop"
}
```

**Response (201):**
```json
{
  "_id": "...",
  "userId": "...",
  "title": "My First Mix",
  "isPublished": false,
  "viewCount": 0,
  "likeCount": 0,
  "createdAt": "2024-03-24T...",
  ...
}
```

#### Get User's Mixes (with pagination)
```http
GET /mixes?limit=10&skip=0&published=false
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "mixes": [...],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

#### Get Single Mix
```http
GET /mixes/{mixId}
Authorization: Bearer <token>
```

#### Update Mix
```http
PUT /mixes/{mixId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["pop", "new-tag"],
  "genre": "Pop"
}
```

**Note:** Only title, description, tags, genre, and volume settings can be updated.

#### Delete Mix (and clean up files)
```http
DELETE /mixes/{mixId}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Mix deleted successfully"
}
```

#### Publish Mix to Community
```http
POST /mixes/{mixId}/publish
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "...",
  "title": "My First Mix",
  "isPublished": true,
  "publishedAt": "2024-03-24T...",
  ...
}
```

#### Unpublish Mix
```http
POST /mixes/{mixId}/unpublish
Authorization: Bearer <token>
```

#### Increment View Count
```http
POST /mixes/{mixId}/view
```

**Note:** No authentication required (anyone can increment views)

#### Like Mix
```http
POST /mixes/{mixId}/like
Authorization: Bearer <token>
```

---

### Community Discovery

#### Get Published Mixes
```http
GET /published-mixes?limit=10&skip=0&genre=Pop&tags=acoustic,vocal
```

**Response (200):**
```json
{
  "mixes": [...],
  "total": 156,
  "page": 1,
  "pages": 16
}
```

#### Search Mixes
```http
GET /published-mixes/search?q=piano
```

**Response (200):**
```json
[
  {
    "_id": "...",
    "title": "Piano Ballad Mix",
    "userId": {...},
    ...
  },
  ...
]
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

This runs tests in `backend/tests/` directory using Node's built-in test runner.

### Manual API Testing with curl

**1. Create account:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "email": "demo@example.com",
    "password": "password123"
  }'
```

**2. Create a mix (replace token and file paths):**
```bash
curl -X POST http://localhost:3000/api/mixes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Demo Mix",
    "description": "Testing the API",
    "backingTrackFile": "backing-demo.mp3",
    "recordingFile": "recording-demo.wav",
    "mixedAudioFile": "mixed-demo.mp3",
    "duration": 200,
    "tags": ["test"],
    "genre": "Pop"
  }'
```

**3. Get your mixes:**
```bash
curl -X GET http://localhost:3000/api/mixes \
  -H "Authorization: Bearer <token>"
```

**4. Publish a mix:**
```bash
curl -X POST http://localhost:3000/api/mixes/<mixId>/publish \
  -H "Authorization: Bearer <token>"
```

**5. Get published mixes (public, no auth needed):**
```bash
curl -X GET "http://localhost:3000/api/published-mixes?limit=5"
```

---

## ✅ Phase 1 Completion Checklist

- [x] User model with bcrypt password hashing
- [x] Mix model with single collection (isPublished flag)
- [x] MixShare model for sharing functionality
- [x] Database indexes on commonly queried fields
- [x] mixService with all CRUD operations
- [x] Authentication routes (signup, login, me)
- [x] Mix management routes (create, read, update, delete)
- [x] Publish/unpublish routes
- [x] Discovery routes (browse, search published)
- [x] Authentication middleware (checkToken)
- [x] Ownership check middleware
- [x] Unit tests for mixService
- [x] API documentation

---

## 🔜 Next Steps (Phase 2)

1. Create audio mixing routes with file upload handling (multer)
2. Implement FFmpeg integration for server-side mixing
3. Add file cleanup utilities
4. Create audio validation middleware
5. Test file upload workflows

## 📝 Notes

- All timestamps are in ISO 8601 format
- Pagination defaults to 10 items per page
- Tokens expire after 7 days
- File paths are relative to `backend/uploads/` directory
- Database indexes automatically created on first model use

---

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Default local URI: `mongodb://localhost:27017/mixify`

**Token Expired:**
- Tokens expire after 7 days. Log in again to get a new token.

**CORS Errors:**
- CORS is enabled for all origins in development
- Restrict in production by updating server.js

---

## 📄 License

ISC
