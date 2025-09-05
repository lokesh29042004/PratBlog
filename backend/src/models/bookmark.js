import db from "../config/dbconnect.js";

export const createBookmarksTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )
    `);
    console.log("Bookmarks table created/verified");
  } catch (err) {
    console.error("Error creating bookmarks table:", err);
  }
};