require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const booksRouter = require("./src/routes/books");
const usersRouter = require("./src/routes/users");
const loansRouter = require("./src/routes/loans");
const statsRouter = require("./src/routes/stats");

const notFound = require("./src/middleware/notFound");
const errorHandler = require("./src/middleware/errorHandler");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}
if (!DB_NAME) {
  console.error("Missing DB_NAME in .env");
  process.exit(1);
}

async function start() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json()); 

  // Connect once on startup
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DB_NAME);

  // Share collection handles to route modules (via app.locals)
  app.locals.db = db;
  app.locals.users = db.collection("users");
  app.locals.books = db.collection("books");
  app.locals.loans = db.collection("loans");

  // Routes
  app.use("/api/books", booksRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/loans", loansRouter);
  app.use("/api/stats", statsRouter);

  // No HTML responses
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
