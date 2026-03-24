# 🎵 Mixify - Audio Mixing Platform

A modern social audio mixing platform for creating ad-libbed soundtracks. Mix your voice with backing tracks and share your creations with the community.

## ✨ Features

- **Audio Mixing**: Record and mix your vocals with backing tracks
- **Sharing**: Share your mixes with friends and the community
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Audio Processing**: FFmpeg integration for high-quality audio processing
- **RESTful API**: Complete API with Express.js and MongoDB
- **Responsive Frontend**: Modern React + Tailwind CSS interface
- **File Management**: Secure file upload and storage with Multer

## 📋 Project Structure

```
Mixify/
├── backend/                 # Express.js + MongoDB API
│   ├── models/             # Database schemas (User, Mix, MixShare)
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── middleware/         # Auth and ownership checks
│   ├── tests/              # Unit tests
│   ├── uploads/            # Audio file storage
│   ├── server.js           # Express app entry point
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React + Vite (Phase 3)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
└── package.json            # Root package configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 5.0+ ([Local Installation](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn** package manager
- **FFmpeg** (for audio processing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/juddin1995/Mixify.git
   cd Mixify
   ```

2. **Install all dependencies:**
   ```bash
   npm run setup
   ```
   This command installs root, backend, and frontend dependencies automatically.

3. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mixify
   SECRET=your-jwt-secret-key-here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

6. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 📚 Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT & bcrypt** - Authentication and security
- **Multer** - File upload handling
- **FFmpeg** - Audio processing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

### Frontend
- **React** 18+ - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user

### Mixes
- `GET /api/mixes` - Retrieve all mixes
- `POST /api/mixes` - Create a new mix
- `GET /api/mixes/:id` - Get mix details
- `PUT /api/mixes/:id` - Update mix
- `DELETE /api/mixes/:id` - Delete mix

### Sharing
- `POST /api/mixes/:id/share` - Share a mix
- `GET /api/mixes/:id/shares` - Get mix shares

## 📦 NPM Scripts

### Root Level
```bash
npm start        # Start backend server
npm run dev      # Start backend with nodemon
npm run setup    # Install all dependencies
npm run build    # Build frontend for production
```

### Backend
```bash
cd backend
npm start        # Start production server
npm run dev      # Start with hot-reload
npm test         # Run unit tests
```

### Frontend
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run test     # Run tests
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Ownership Verification**: Middleware to verify user ownership of resources
- **CORS Protection**: Cross-origin resource sharing configuration
- **Environment Variables**: Sensitive data stored in `.env` files (never commit to repo)

## 🧪 Testing

Run backend tests:
```bash
npm test
```

Tests are located in `backend/tests/` directory using Node.js native test runner.

## 🛠 Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -am 'Add new feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a pull request with a detailed description

## 📄 Environment Variables

Create a `backend/.env` file (copy from `.env.example`):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mixify

# Authentication
SECRET=your-super-secret-jwt-key-min-32-chars-long

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env` file
- Verify MongoDB is accessible at the specified URI

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### FFmpeg Not Found
- Install FFmpeg: [Installation Guide](https://ffmpeg.org/download.html)
- Verify installation: `ffmpeg -version`

### Dependency Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm run setup
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Commit and push your changes
6. Open a pull request

## 📄 License

ISC

## 👤 Author

[@juddin1995](https://github.com/juddin1995)

## 📞 Support

For issues, questions, or suggestions, please open an [issue](https://github.com/juddin1995/Mixify/issues) on GitHub.

---

**Happy mixing! 🎵**