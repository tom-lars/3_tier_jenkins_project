const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS - Allow frontend access from a specific origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "appdb",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

// Test database connection on startup
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully at", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Exit process on failure
  }
})();

// Initialize the database
const initDb = async () => {
  let retries = 5;
  while (retries) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Database initialized successfully");

      // Check if table is empty and add sample data
      const count = await pool.query("SELECT COUNT(*) FROM messages");
      if (parseInt(count.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO messages (name, email, message) 
          VALUES 
          ('John Doe', 'john@example.com', 'Hello, this is a test message!'),
          ('Jane Smith', 'jane@example.com', 'The application is working great!')
        `);
        console.log("✅ Added sample data to messages table");
      }
      break;
    } catch (err) {
      console.error("❌ Error initializing database:", err);
      retries -= 1;
      console.log(`🔄 Retrying... ${retries} attempts left`);
      await new Promise((res) => setTimeout(res, 5000)); // Wait before retrying
    }
  }
};

// Root Route (Fix for "Route not found")
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// API Routes
app.get("/messages", async (req, res) => {
  try {
    console.log("📩 GET /messages - Fetching messages from database");
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 100"
    );
    console.log(`✅ Retrieved ${result.rows.length} messages`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/messages", async (req, res) => {
  const { name, email, message } = req.body;

  console.log("📩 POST /messages - Received message:", {
    name,
    email,
    message: message.substring(0, 20) + "...",
  });

  if (!name || !email || !message) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message]
    );
    console.log("✅ Message saved with ID:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling for undefined routes
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDb();
});

module.exports = app;
