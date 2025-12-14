// Run: mongosh --file database/seed_step.js

const DB_NAME = "library_loan_service";
const dbRef = db.getSiblingDB(DB_NAME);

print(`\n== Step 2 Seeding database: ${DB_NAME} ==`);

// Rebuild collections for schema
dbRef.users.drop();
dbRef.books.drop();
dbRef.loans.drop();

dbRef.createCollection("users");
dbRef.createCollection("books");
dbRef.createCollection("loans");

// ---------- USERS (8 docs) ----------
const u1 = new ObjectId();
const u2 = new ObjectId();
const u3 = new ObjectId();
const u4 = new ObjectId();
const u5 = new ObjectId();
const u6 = new ObjectId();
const u7 = new ObjectId();
const u8 = new ObjectId();

dbRef.users.insertMany([
  { _id: u1, name: "Jane Doe",           email: "jane.doe@example.com",           createdAt: new Date("2025-12-01T10:00:00Z") },
  { _id: u2, name: "John Smith",         email: "john.smith@example.com",         createdAt: new Date("2025-12-02T11:00:00Z") },
  { _id: u3, name: "Alice Johnson",      email: "alice.johnson@example.com",      createdAt: new Date("2025-12-03T12:00:00Z") },
  { _id: u4, name: "Michael Brown",      email: "michael.brown@example.com",      createdAt: new Date("2025-12-04T13:00:00Z") },
  { _id: u5, name: "Emily Davis",        email: "emily.davis@example.com",        createdAt: new Date("2025-12-05T14:00:00Z") },
  { _id: u6, name: "Daniel Wilson",      email: "daniel.wilson@example.com",      createdAt: new Date("2025-12-06T15:00:00Z") },
  { _id: u7, name: "Sophia Martinez",    email: "sophia.martinez@example.com",    createdAt: new Date("2025-12-07T16:00:00Z") },
  { _id: u8, name: "William Anderson",   email: "william.anderson@example.com",   createdAt: new Date("2025-12-08T17:00:00Z") }
]);

// ---------- BOOKS (10 docs) ----------
const b1  = new ObjectId();
const b2  = new ObjectId();
const b3  = new ObjectId();
const b4  = new ObjectId();
const b5  = new ObjectId();
const b6  = new ObjectId();
const b7  = new ObjectId();
const b8  = new ObjectId();
const b9  = new ObjectId();
const b10 = new ObjectId();

dbRef.books.insertMany([
  { _id: b1,  title: "Clean Code",                         author: "Robert C. Martin",    tags: ["software", "engineering"], availableCopies: 2 },
  { _id: b2,  title: "The Pragmatic Programmer",           author: "Andrew Hunt",         tags: ["software", "practice"],    availableCopies: 3 },
  { _id: b3,  title: "Design Patterns",                    author: "Erich Gamma",         tags: ["software", "design"],      availableCopies: 1 },
  { _id: b4,  title: "Introduction to Algorithms",         author: "Thomas H. Cormen",    tags: ["algorithms", "cs"],        availableCopies: 2 },
  { _id: b5,  title: "Database System Concepts",           author: "Abraham Silberschatz",tags: ["databases", "cs"],         availableCopies: 4 },
  { _id: b6,  title: "Operating System Concepts",          author: "Abraham Silberschatz",tags: ["os", "cs"],                availableCopies: 2 },
  { _id: b7,  title: "Computer Networks",                  author: "Andrew S. Tanenbaum", tags: ["networks", "cs"],          availableCopies: 3 },
  { _id: b8,  title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", tags: ["ai", "cs"],            availableCopies: 2 },
  { _id: b9,  title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", tags: ["cs", "programming"], availableCopies: 1 },
  { _id: b10, title: "You Don’t Know JS Yet",              author: "Kyle Simpson",        tags: ["javascript", "web"],       availableCopies: 5 }
]);

// ---------- LOANS (10 docs) ----------
const l1  = new ObjectId();
const l2  = new ObjectId();
const l3  = new ObjectId();
const l4  = new ObjectId();
const l5  = new ObjectId();
const l6  = new ObjectId();
const l7  = new ObjectId();
const l8  = new ObjectId();
const l9  = new ObjectId();
const l10 = new ObjectId();

dbRef.loans.insertMany([
  { _id: l1,  userId: u1, bookId: b1,  loanDate: new Date("2025-12-10T10:00:00Z"), returnDate: null,                         status: "OPEN" },
  { _id: l2,  userId: u2, bookId: b2,  loanDate: new Date("2025-12-09T09:00:00Z"), returnDate: new Date("2025-12-11T09:00:00Z"), status: "RETURNED" },
  { _id: l3,  userId: u3, bookId: b3,  loanDate: new Date("2025-12-08T08:00:00Z"), returnDate: null,                         status: "OPEN" },
  { _id: l4,  userId: u4, bookId: b4,  loanDate: new Date("2025-12-01T07:00:00Z"), returnDate: new Date("2025-12-05T07:00:00Z"), status: "RETURNED" },
  { _id: l5,  userId: u5, bookId: b5,  loanDate: new Date("2025-12-02T12:00:00Z"), returnDate: null,                         status: "OPEN" },
  { _id: l6,  userId: u6, bookId: b6,  loanDate: new Date("2025-12-03T13:00:00Z"), returnDate: new Date("2025-12-06T13:00:00Z"), status: "RETURNED" },
  { _id: l7,  userId: u7, bookId: b7,  loanDate: new Date("2025-12-04T14:00:00Z"), returnDate: null,                         status: "OPEN" },
  { _id: l8,  userId: u8, bookId: b8,  loanDate: new Date("2025-12-05T15:00:00Z"), returnDate: new Date("2025-12-07T15:00:00Z"), status: "RETURNED" },
  { _id: l9,  userId: u1, bookId: b9,  loanDate: new Date("2025-12-06T16:00:00Z"), returnDate: null,                         status: "OPEN" },
  { _id: l10, userId: u2, bookId: b10, loanDate: new Date("2025-12-07T17:00:00Z"), returnDate: new Date("2025-12-09T17:00:00Z"), status: "RETURNED" }
]);

print("Users:", dbRef.users.countDocuments());
print("Books:", dbRef.books.countDocuments());
print("Loans:", dbRef.loans.countDocuments());
print("\n== Done Step 2 ==\n");
