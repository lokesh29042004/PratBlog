import db from "../config/dbconnect.js";

// Generate URL slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

export const getAllBlogs = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT b.id, b.title, b.slug, b.description, b.created_at, b.category, b.user_id,
             u.display_name, u.picture,
             '/blog/' || b.id || '/image' AS image_url,
             COALESCE(likes.count, 0) as likes_count,
             COALESCE(views.count, 0) as views_count
      FROM blog_posts b
      JOIN users u ON b.user_id = u.id
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
      ORDER BY b.created_at DESC
    `);

    res.json({ success: true, blogs: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    // Track view
    const userId = req.isAuthenticated() ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Insert view (will be ignored if duplicate due to UNIQUE constraint)
    await db.query(
      "INSERT INTO blog_views (blog_id, user_id, ip_address) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [req.params.id, userId, ipAddress]
    );

    const { rows } = await db.query(
      `SELECT b.id, b.title, b.description, b.content, b.category, b.created_at, b.user_id,
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
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog: rows[0] });
  } catch (err) {
    console.error("Error fetching blog:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createBlog = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const { title, description, category, content } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "Image file is required" });
  }

  try {
    const slug = generateSlug(title);
    
    const result = await db.query(
      "INSERT INTO blog_posts (user_id, title, slug, category, description, content, image, mimetype) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, slug",
      [req.user.id, title, slug, category, description, content, file.buffer, file.mimetype]
    );
    
    res.json({ success: true, message: "Blog created successfully!", blogId: result.rows[0].id, slug: result.rows[0].slug });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ success: false, message: "Error creating blog" });
  }
};

export const deleteBlog = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

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
};

export const updateBlog = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const { title, description, category, content } = req.body;
  const blogId = req.params.id;
  const file = req.file;

  try {
    // Check if user owns the blog
    const { rows: blogRows } = await db.query(
      "SELECT user_id FROM blog_posts WHERE id = $1",
      [blogId]
    );

    if (blogRows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (blogRows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this blog" });
    }

    // Update blog with or without new image
    if (file) {
      await db.query(
        "UPDATE blog_posts SET title = $1, category = $2, description = $3, content = $4, image = $5, mimetype = $6 WHERE id = $7",
        [title, category, description, content, file.buffer, file.mimetype, blogId]
      );
    } else {
      await db.query(
        "UPDATE blog_posts SET title = $1, category = $2, description = $3, content = $4 WHERE id = $5",
        [title, category, description, content, blogId]
      );
    }
    
    res.json({ success: true, message: "Blog updated successfully!" });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ success: false, message: "Error updating blog" });
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT b.id, b.title, b.slug, b.description, b.content, b.category, b.created_at,
             '/blog/' || b.id || '/image' AS image_url,
             u.display_name, u.picture, u.email, b.user_id,
             COALESCE(likes.count, 0) as likes_count,
             COALESCE(views.count, 0) as views_count
      FROM blog_posts b
      JOIN users u ON b.user_id = u.id
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
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.params.id]);

    res.json({ success: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};