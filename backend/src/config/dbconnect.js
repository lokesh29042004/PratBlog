// import pg from "pg";
// import env from "dotenv";

// env.config(); // make sure environment variables are loaded here too

// const db = new pg.Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });

// export default db;

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();


// Use DATABASE_URL directly
 const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Render requires SSL
});
 
export default db;