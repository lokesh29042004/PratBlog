import db from "../config/dbconnect.js";

export const createViewsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_views (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create unique index separately
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_views_unique 
      ON blog_views(blog_id, COALESCE(user_id, 0), ip_address, DATE(created_at))
    `);
    
    console.log("Blog views table created/verified");
  } catch (err) {
    console.error("Error creating blog_views table:", err);
  }
};