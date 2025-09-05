import express from "express";
import bodyParser from "body-parser";
import passport from "./src/config/passport.js";
import session from "express-session";
import env from "dotenv";
import cors from "cors";
import db from "./src/config/dbconnect.js";
import authRoutes from "./src/routes/authroutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import blogRoutes from "./src/routes/blogroutes.js";
import { initializeDatabase } from "./src/config/initDb.js";



 env.config();
const app = express();
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

// db.connect();
(async () => {
  try {
    await db.connect();
    console.log("✅ Connected to Render PostgreSQL");

    // Initialize tables after successful connection
    await initializeDatabase();

    // Start server only after DB is ready
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // exit app if DB connection fails
  }
})();



// CORS setup - handle multiple frontend URLs for different environments
const getAllowedOrigins = () => {
  const origins = [];
  
  // Add development URL
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:8080');
  }
  
  // Add production frontend URL
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  return origins;
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.set("view engine", "ejs"); // only needed if you use EJS templates

// Sessions - must be before CORS
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: true, // Changed to true for OAuth
    name: 'sessionId', // Custom session name
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: false, // Allow frontend to read session cookie
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    },
  })
);

// Middlewares
app.use(cors(corsOptions)); // CORS after session
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Passport - must be after session
app.use(passport.initialize());
app.use(passport.session());



// Routes
app.use("/", authRoutes);
app.use("/api", commentRoutes);
app.use("/api", userRoutes);
app.use("/api", blogRoutes);


