import { createUsersTable, createUserFollowsTable } from "../models/user.js";
import { createBlogTable, createBlogLikesTable } from "../models/blog.js";
import { createCommentsTable, createCommentLikesTable } from "../models/comment.js";
import { createBookmarksTable } from "../models/bookmark.js";
import { createViewsTable } from "../models/view.js";

export const initializeDatabase = async () => {
  console.log("🔄 Initializing database tables...");
  
  await createUsersTable();
  await createBlogTable();
  await createCommentsTable();
  await createCommentLikesTable();
  await createBlogLikesTable();
  await createUserFollowsTable();
  await createBookmarksTable();
  await createViewsTable();
  
  console.log("✅ Database initialization complete");
};