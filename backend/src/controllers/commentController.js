import db from "../config/dbconnect.js";

export const getCommentsByBlogId = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.id, c.content, c.created_at, c.parent_id, c.likes_count,
             u.display_name, u.picture, u.email, u.id as user_id,
             CASE 
               WHEN u.picture IS NOT NULL AND u.picture NOT LIKE 'http%' THEN '/api/users/' || u.id || '/avatar'
               ELSE u.picture
             END as picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.blogId]);

    // Organize comments into nested structure
    const commentsMap = new Map();
    const rootComments = [];

    rows.forEach(comment => {
      comment.replies = [];
      commentsMap.set(comment.id, comment);
      
      if (comment.parent_id === null) {
        rootComments.push(comment);
      }
    });

    rows.forEach(comment => {
      if (comment.parent_id !== null) {
        const parent = commentsMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    res.json({ success: true, comments: rootComments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ success: false, message: "Error fetching comments" });
  }
};

export const createComment = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const { content, parentId } = req.body;
  const { blogId } = req.params;

  try {
    const result = await db.query(
      "INSERT INTO comments (blog_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [blogId, req.user.id, content, parentId || null]
    );

    // Get the comment with user info
    const { rows } = await db.query(`
      SELECT c.id, c.content, c.created_at, c.parent_id, c.likes_count,
             u.display_name, u.picture, u.email, u.id as user_id,
             CASE 
               WHEN u.picture IS NOT NULL AND u.picture NOT LIKE 'http%' THEN '/api/users/' || u.id || '/avatar'
               ELSE u.picture
             END as picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [result.rows[0].id]);

    res.json({ success: true, comment: rows[0] });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ success: false, message: "Error creating comment" });
  }
};

export const likeComment = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const { commentId } = req.params;

  try {
    // Check if user already liked this comment
    const existingLike = await db.query(
      "SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      [commentId, req.user.id]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query("DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2", [commentId, req.user.id]);
      await db.query("UPDATE comments SET likes_count = likes_count - 1 WHERE id = $1", [commentId]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      await db.query("INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)", [commentId, req.user.id]);
      await db.query("UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1", [commentId]);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    console.error("Error toggling comment like:", err);
    res.status(500).json({ success: false, message: "Error toggling like" });
  }
};