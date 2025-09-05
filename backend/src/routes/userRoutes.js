import { Router } from "express";
import multer from "multer";
import db from "../config/dbconnect.js";
import { getUserProfile, updateUserProfile, uploadAvatar, uploadCoverImage, getUserAvatar, getUserCoverImage } from "../controllers/userController.js";

const router = Router();
const upload = multer();

// Get user profile
router.get("/users/:id", getUserProfile);

// Update user profile
router.put("/users/:id", updateUserProfile);

// Upload avatar
router.post("/users/:id/avatar", upload.single("avatar"), uploadAvatar);

// Upload cover image
router.post("/users/:id/cover", upload.single("cover"), uploadCoverImage);

// Get user avatar
router.get("/users/:id/avatar", getUserAvatar);

// Get user cover image
router.get("/users/:id/cover", getUserCoverImage);

// Get user's bookmarked blogs
router.get("/users/:id/bookmarks", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT b.id, b.title, b.description, b.category, b.created_at,
             '/blog/' || b.id || '/image' AS image_url,
             u.display_name, u.picture, u.email, b.user_id,
             COALESCE(likes.count, 0) as likes_count,
             COALESCE(views.count, 0) as views_count
      FROM blog_posts b
      JOIN users u ON b.user_id = u.id
      JOIN bookmarks bm ON b.id = bm.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as count 
        FROM blog_likes 
        GROUP BY blog_id
      ) likes ON b.id = likes.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as count 
        FROM blog_views 
        GROUP BY blog_id
      ) views ON b.id = views.blog_id
      WHERE bm.user_id = $1
      ORDER BY bm.created_at DESC
    `, [req.params.id]);

    res.json({ success: true, blogs: rows });
  } catch (err) {
    console.error("Error fetching bookmarked blogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user's liked blogs
router.get("/users/:id/liked-blogs", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT b.id, b.title, b.description, b.category, b.created_at,
             '/blog/' || b.id || '/image' AS image_url,
             u.display_name, u.picture, u.email, b.user_id,
             COALESCE(likes.count, 0) as likes_count,
             COALESCE(views.count, 0) as views_count
      FROM blog_posts b
      JOIN users u ON b.user_id = u.id
      JOIN blog_likes bl ON b.id = bl.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as count 
        FROM blog_likes 
        GROUP BY blog_id
      ) likes ON b.id = likes.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as count 
        FROM blog_views 
        GROUP BY blog_id
      ) views ON b.id = views.blog_id
      WHERE bl.user_id = $1
      ORDER BY bl.created_at DESC
    `, [req.params.id]);

    res.json({ success: true, blogs: rows });
  } catch (err) {
    console.error("Error fetching liked blogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;