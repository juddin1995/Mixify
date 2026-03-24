import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import mixesRoutes from "./routes/mixes.js";
import discoveryRoutes from "./routes/discovery.js";
import sharesRoutes from "./routes/shares.js";
import usersRoutes from "./routes/users.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mixes", mixesRoutes);
app.use("/api/published-mixes", discoveryRoutes);
app.use("/api/shares", sharesRoutes);
app.use("/api/users", usersRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({ error: error.message || "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mixify backend server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
