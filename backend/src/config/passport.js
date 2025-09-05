import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import db from "./dbconnect.js";

// --------------------
// Local Strategy
// --------------------
passport.use(
  new LocalStrategy(
    { email: "email", password: "password" }, 
    async (email, password, done) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
          return done(null, false, { message: "User not found" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// --------------------
// Google Strategy
// --------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? "https://pratblog-backend.onrender.com/auth/google/callback"
        : "http://localhost:3000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos && profile.photos[0]?.value;

        if (!email) return cb(null, false, { message: "No email from Google" });

        // check if user exists
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        let user;
        if (result.rows.length === 0) {
          // create new user with google details
          const newUser = await db.query(
            `INSERT INTO users (email, password, display_name, picture) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [email, "google", name, picture]
          );
          user = newUser.rows[0];
        } else {
          // user exists → update name & picture if changed
          user = result.rows[0];
          await db.query(
            `UPDATE users SET display_name = $1, picture = $2 WHERE email = $3`,
            [name, picture, email]
          );
          user.display_name = name;
          user.picture = picture;
        }

        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// --------------------
// Session serialize / deserialize
// --------------------
passport.serializeUser((user, done) => {
  done(null, user.email); // only store email in session
});

passport.deserializeUser(async (email, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    done(null, result.rows[0] || false);
  } catch (err) {
    done(err);
  }
});
export default passport;