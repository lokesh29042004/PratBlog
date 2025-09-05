import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import db from "../config/dbconnect.js";

const router = Router();

// Test route to verify blog routes are working
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Blog routes are working!" });
});

// Like/unlike a blog
router.post("/blogs/:id/like", requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user already liked this blog
    const existingLike = await db.query(
      "SELECT * FROM blog_likes WHERE blog_id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query("DELETE FROM blog_likes WHERE blog_id = $1 AND user_id = $2", [id, req.user.id]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      await db.query("INSERT INTO blog_likes (blog_id, user_id) VALUES ($1, $2)", [id, req.user.id]);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    console.error("Error toggling blog like:", err);
    res.status(500).json({ success: false, message: "Error toggling like" });
  }
});

// Get blog likes count and user's like status
router.get("/blogs/:id/likes", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get total likes count
    const likesCount = await db.query("SELECT COUNT(*) FROM blog_likes WHERE blog_id = $1", [id]);
    
    let userLiked = false;
    if (req.isAuthenticated()) {
      const userLike = await db.query(
        "SELECT * FROM blog_likes WHERE blog_id = $1 AND user_id = $2",
        [id, req.user.id]
      );
      userLiked = userLike.rows.length > 0;
    }

    res.json({ 
      success: true, 
      likesCount: parseInt(likesCount.rows[0].count),
      userLiked 
    });
  } catch (err) {
    console.error("Error fetching blog likes:", err);
    res.status(500).json({ success: false, message: "Error fetching likes" });
  }
});

// Get trending blogs (most liked in last 7 days)
router.get("/blogs/trending", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT b.id, b.title, b.description, b.created_at, b.category,
             u.display_name, u.picture,
             '/blog/' || b.id || '/image' AS image_url,
             COUNT(bl.id) as likes_count
      FROM blog_posts b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN blog_likes bl ON b.id = bl.blog_id AND bl.created_at > NOW() - INTERVAL '7 days'
      WHERE b.created_at > NOW() - INTERVAL '30 days'
      GROUP BY b.id, u.id
      ORDER BY likes_count DESC, b.created_at DESC
      LIMIT 10
    `);

    res.json({ success: true, blogs: rows });
  } catch (err) {
    console.error("Error fetching trending blogs:", err);
    res.status(500).json({ success: false, message: "Error fetching trending blogs" });
  }
});

// Bookmark/unbookmark a blog
router.post("/blogs/:id/bookmark", requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user already bookmarked this blog
    const existingBookmark = await db.query(
      "SELECT * FROM bookmarks WHERE blog_id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (existingBookmark.rows.length > 0) {
      // Remove bookmark
      await db.query("DELETE FROM bookmarks WHERE blog_id = $1 AND user_id = $2", [id, req.user.id]);
      res.json({ success: true, bookmarked: false });
    } else {
      // Add bookmark
      await db.query("INSERT INTO bookmarks (blog_id, user_id) VALUES ($1, $2)", [id, req.user.id]);
      res.json({ success: true, bookmarked: true });
    }
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    res.status(500).json({ success: false, message: "Error toggling bookmark" });
  }
});

// Get bookmark status
router.get("/blogs/:id/bookmark", async (req, res) => {
  const { id } = req.params;
  
  try {
    let bookmarked = false;
    if (req.isAuthenticated()) {
      const bookmark = await db.query(
        "SELECT * FROM bookmarks WHERE blog_id = $1 AND user_id = $2",
        [id, req.user.id]
      );
      bookmarked = bookmark.rows.length > 0;
    }

    res.json({ success: true, bookmarked });
  } catch (err) {
    console.error("Error fetching bookmark status:", err);
    res.status(500).json({ success: false, message: "Error fetching bookmark status" });
  }
});

// Delete a blog
router.delete("/blogs/:id", requireAuth, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    // Check if user owns the blog
    const { rows: blogRows } = await db.query(
      "SELECT user_id FROM blog_posts WHERE id = $1",
      [blogId]
    );

    if (blogRows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (blogRows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this blog" });
    }

    // Delete related data first
    await db.query("DELETE FROM comments WHERE blog_id = $1", [blogId]);
    await db.query("DELETE FROM blog_likes WHERE blog_id = $1", [blogId]);
    await db.query("DELETE FROM blog_views WHERE blog_id = $1", [blogId]);
    await db.query("DELETE FROM bookmarks WHERE blog_id = $1", [blogId]);
    
    // Delete the blog
    await db.query("DELETE FROM blog_posts WHERE id = $1", [blogId]);

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;