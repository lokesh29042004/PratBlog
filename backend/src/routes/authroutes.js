import { Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import db from "../config/dbconnect.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { getAllBlogs, getBlogById, createBlog, updateBlog, getUserBlogs } from "../controllers/blogController.js";

const router = Router();
const saltRounds = 10;

// --------------------
// Register
// --------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // only Gmail allowed (optional)
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ success: false, message: "Only Gmail accounts allowed" });
    }

    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashed]
    );

    res.status(201).json({ success: true, message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// Local Login
// --------------------
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info?.message || "Login failed" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, message: "Login successful", user: { email: user.email } });
    });
  })(req, res, next);
});

// --------------------
// Logout
// --------------------
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.json({ success: true, message: "Logged out" });
  });
});

// --------------------
// Protected Route (Example)
// --------------------


// --------------------
// Google OAuth
// --------------------
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  (req, res) => {
    // Generate JWT token for cross-origin auth
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.SESSION_SECRET || 'secret123',
      { expiresIn: '24h' }
    );
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
  }
);

router.get("/auth/google/failure", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed" });
});

// --------------------
// Current User
// --------------------
router.get("/me", async (req, res) => {
  // Check session first
  if (req.isAuthenticated()) {
    return res.json({ success: true, user: req.user });
  }
  
  // Check JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'secret123');
      const result = await db.query("SELECT * FROM users WHERE id = $1", [decoded.userId]);
      if (result.rows.length > 0) {
        return res.json({ success: true, user: result.rows[0] });
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired', expired: true });
      }
      console.error('JWT verification failed:', err);
    }
  }
  
  res.json({ success: false, message: 'Not authenticated' });
});
router.get("/user-picture", async (req, res) => {
  try {
    const url = req.query.url; // original Google picture URL
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).send("Error fetching image");
  }
});

const upload = multer(); // stores file in memory

// Blog routes
router.post("/blog", upload.single("image"), createBlog);
router.put("/api/blogs/:id", upload.single("image"), updateBlog);


router.get("/blogs", getAllBlogs);
// Serve blog image
router.get("/blog/:id/image", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT image, mimetype FROM blog_posts WHERE id = $1",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send("Image not found");
    }

    const blog = rows[0];
    res.set("Content-Type", blog.mimetype);
    res.send(blog.image);
  } catch (err) {
    console.error("Error fetching blog image:", err);
    res.status(500).send("Error fetching image");
  }
});

router.get("/user/:id/blogs", getUserBlogs);

router.get("/blogs/:id", getBlogById);

// Get blog by slug
router.get("/blog/:slug", async (req, res) => {
  try {
    // Track view
    const userId = req.isAuthenticated() ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get blog by slug first
    const { rows: blogRows } = await db.query(
      "SELECT id FROM blog_posts WHERE slug = $1",
      [req.params.slug]
    );
    
    if (blogRows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    const blogId = blogRows[0].id;
    
    // Insert view (will be ignored if duplicate due to UNIQUE constraint)
    await db.query(
      "INSERT INTO blog_views (blog_id, user_id, ip_address) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [blogId, userId, ipAddress]
    );

    const { rows } = await db.query(
      `SELECT b.id, b.title, b.slug, b.description, b.content, b.category, b.created_at, b.user_id,
              '/blog/' || b.id || '/image' AS image_url,
              u.display_name, u.picture, u.email,
              COALESCE(views.count, 0) as views_count
       FROM blog_posts b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN (
         SELECT blog_id, COUNT(*) as count 
         FROM blog_views 
         GROUP BY blog_id
       ) views ON b.id = views.blog_id
       WHERE b.slug = $1`,
      [req.params.slug]
    );

    res.json({ success: true, blog: rows[0] });
  } catch (err) {
    console.error("Error fetching blog by slug:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});





// Generate XML Sitemap
router.get("/sitemap.xml", async (req, res) => {
  try {
    const { rows: blogs } = await db.query(
      "SELECT slug, created_at FROM blog_posts ORDER BY created_at DESC"
    );

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add homepage
    sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add static pages
    const staticPages = ['explore', 'about'];
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add blog posts
    blogs.forEach(blog => {
      const lastmod = new Date(blog.created_at).toISOString();
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
