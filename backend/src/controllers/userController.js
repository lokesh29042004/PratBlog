import db from "../config/dbconnect.js";

export const getUserProfile = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, email, display_name, picture, bio, skills, location, website, twitter, linkedin, created_at, avatar_data, cover_image, avatar_mimetype, cover_image_mimetype FROM users WHERE id = $1",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const { display_name, bio, skills, location, website, twitter, linkedin } = req.body;

  try {
    await db.query(
      "UPDATE users SET display_name = $1, bio = $2, skills = $3, location = $4, website = $5, twitter = $6, linkedin = $7 WHERE id = $8",
      [display_name, bio, skills, location, website, twitter, linkedin, req.params.id]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

export const uploadAvatar = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  // Check if user is updating their own profile
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    await db.query(
      "UPDATE users SET avatar_data = $1, avatar_mimetype = $2 WHERE id = $3",
      [file.buffer, file.mimetype, req.params.id]
    );

    res.json({ success: true, message: "Avatar updated successfully" });
  } catch (err) {
    console.error("Error uploading avatar:", err);
    res.status(500).json({ success: false, message: "Error uploading avatar" });
  }
};

export const uploadCoverImage = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  // Check if user is updating their own profile
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    await db.query(
      "UPDATE users SET cover_image = $1, cover_image_mimetype = $2 WHERE id = $3",
      [file.buffer, file.mimetype, req.params.id]
    );

    res.json({ success: true, message: "Cover image updated successfully" });
  } catch (err) {
    console.error("Error uploading cover image:", err);
    res.status(500).json({ success: false, message: "Error uploading cover image" });
  }
};

export const getUserAvatar = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT avatar_data, avatar_mimetype, picture FROM users WHERE id = $1",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = rows[0];
    
    // Check for uploaded avatar first, then fallback to OAuth picture
    if (user.avatar_data) {
      res.set("Content-Type", user.avatar_mimetype || "image/jpeg");
      res.send(user.avatar_data);
    } else if (user.picture && user.picture.startsWith('http')) {
      // Proxy the OAuth picture to avoid CORS/ORB issues
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(user.picture);
        if (response.ok) {
          const buffer = await response.buffer();
          res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
          res.send(buffer);
        } else {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
      } catch (error) {
        console.log('Failed to proxy OAuth picture:', error.message);
        // Generate SVG fallback
        const { rows: userRows } = await db.query(
          "SELECT display_name, email FROM users WHERE id = $1",
          [req.params.id]
        );
        
        if (userRows.length > 0) {
          const userName = userRows[0].display_name || userRows[0].email || "User";
          const initials = userName
            .split(" ")
            .map(name => name[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          
          const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#6366f1"/>
            <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
          </svg>`;
          
          res.set("Content-Type", "image/svg+xml");
          res.send(svg);
        } else {
          res.status(404).send("Avatar not found");
        }
      }
    } else {
      res.status(404).send("Avatar not found");
    }
  } catch (err) {
    console.error("Error fetching avatar:", err);
    res.status(500).send("Error fetching avatar");
  }
};

export const getUserCoverImage = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT cover_image, cover_image_mimetype FROM users WHERE id = $1",
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].cover_image) {
      return res.status(404).send("Cover image not found");
    }

    const user = rows[0];
    res.set("Content-Type", user.cover_image_mimetype || "image/jpeg");
    res.send(user.cover_image);
  } catch (err) {
    console.error("Error fetching cover image:", err);
    res.status(500).send("Error fetching cover image");
  }
};