# PratBlog Backend

Node.js/Express backend for the PratBlog platform with PostgreSQL database.

## Features

- **Authentication**: Local login/register + Google OAuth
- **Blog Management**: Create, read, update blogs with image uploads
- **Comment System**: Nested comments with likes
- **User Profiles**: Customizable profiles with avatar/cover images
- **Social Features**: Blog likes, user follows
- **File Uploads**: Image handling with multer

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Make sure PostgreSQL is running
   - Create database: `goggle auth`
   - Run migrations: Execute `migrations.sql` in your PostgreSQL client

3. **Environment Variables**
   - Copy `.env` file with your database credentials
   - Add Google OAuth credentials

4. **Start Server**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /logout` - Logout user
- `GET /me` - Get current user
- `GET /auth/google` - Google OAuth login

### Blogs
- `GET /blogs` - Get all blogs
- `GET /blogs/:id` - Get single blog
- `POST /blog` - Create new blog (auth required)
- `GET /user/:id/blogs` - Get user's blogs
- `POST /api/blogs/:id/like` - Like/unlike blog
- `GET /api/blogs/:id/likes` - Get blog likes
- `GET /api/blogs/trending` - Get trending blogs

### Comments
- `GET /api/blogs/:blogId/comments` - Get blog comments
- `POST /api/blogs/:blogId/comments` - Create comment (auth required)
- `POST /api/comments/:commentId/like` - Like/unlike comment

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (auth required)
- `POST /api/users/:id/avatar` - Upload avatar
- `POST /api/users/:id/cover` - Upload cover image
- `GET /api/users/:id/avatar` - Get user avatar
- `GET /api/users/:id/cover` - Get user cover image

## Database Schema

- **users**: User accounts with profiles
- **blog_posts**: Blog content with images
- **comments**: Nested comment system
- **comment_likes**: Comment like tracking
- **blog_likes**: Blog like tracking
- **user_follows**: User follow relationships

## Tech Stack

- Node.js + Express
- PostgreSQL
- Passport.js (Local + Google OAuth)
- Multer (File uploads)
- bcrypt (Password hashing)
- CORS enabled for frontend