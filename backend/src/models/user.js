import db from "../config/dbconnect.js";

export const createUsersTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        display_name VARCHAR(255),
        picture TEXT,
        picture_mimetype VARCHAR(100),
        bio TEXT,
        skills TEXT, -- JSON string
        social_links TEXT, -- JSON string
        cover_image BYTEA,
        cover_image_mimetype VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created/verified");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};

export const createUserFollowsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);
    console.log("User follows table created/verified");
  } catch (err) {
    console.error("Error creating user_follows table:", err);
  }
};