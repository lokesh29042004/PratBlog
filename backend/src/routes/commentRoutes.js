import { Router } from "express";
import db from "../config/dbconnect.js";
import { getCommentsByBlogId, createComment, likeComment } from "../controllers/commentController.js";

const router = Router();

// Get comments for a blog
router.get("/blogs/:blogId/comments", getCommentsByBlogId);

// Create a new comment
router.post("/blogs/:blogId/comments", createComment);

// Update a comment
router.put("/comments/:commentId", async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.commentId;
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    const userId = req.user.id;

    // Check if user owns the comment
    const { rows: commentRows } = await db.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (commentRows.length === 0) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (commentRows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this comment" });
    }

    // Update the comment
    await db.query(
      "UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [content, commentId]
    );

    res.json({ success: true, message: "Comment updated successfully" });
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Like/unlike a comment
router.post("/comments/:commentId/like", likeComment);

export default router;