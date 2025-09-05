import db from "../config/dbconnect.js";

export const createBlogTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        category VARCHAR(100),
        image BYTEA,
        mimetype VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Blog posts table created/verified");
  } catch (err) {
    console.error("Error creating blog_posts table:", err);
  }
};

export const createBlogLikesTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_likes (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )
    `);
    console.log("Blog likes table created/verified");
  } catch (err) {
    console.error("Error creating blog_likes table:", err);
  }
};