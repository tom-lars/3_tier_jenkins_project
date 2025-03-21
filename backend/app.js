const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;

const db = mysql.createConnection({
  host: "database-service",
  user: "root",
  password: "rootpass",
  database: "appdb",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Backend API!");
});

app.get("/data", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
