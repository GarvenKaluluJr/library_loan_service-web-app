# Library Loan Service — JSON API Contract 

Base path: /api

Response formats (mandatory)
- Success always returns JSON: { "data": ... }
- Error always returns JSON: { "error": { "code": "...", "message": "..." } }


1) GET /api/books

Purpose: list/search books
MongoDB: find
Query params:
- q (optional)
- tag (optional)

Rules:
- If q is provided: match title OR author (case-insensitive).
- If tag is provided: tags array contains tag.
- If both are provided: apply both filters.

Example request:
  GET /api/books?q=code&tag=software

Success response example:
  {
    "data": [
      {
        "_id": "ObjectIdString",
        "title": "string",
        "author": "string",
        "tags": ["string"],
        "availableCopies": 0
      }
    ]
  }

Error response example:
  {
    "error": { "code": "INTERNAL_ERROR", "message": "Unexpected server error." }
  }

2) GET /api/users

Purpose: list users
MongoDB: find

Example request:
  GET /api/users

Success response example:
  {
    "data": [
      {
        "_id": "ObjectIdString",
        "name": "string",
        "email": "string",
        "createdAt": "ISODateString"
      }
    ]
  }

Error response example:
  {
    "error": { "code": "INTERNAL_ERROR", "message": "Unexpected server error." }
  }

3) POST /api/loans

Purpose: create a new loan (borrow a book)
MongoDB: insertOne + findOneAndUpdate on books.availableCopies

Headers:
  Content-Type: application/json

Request body (required):
  {
    "userId": "ObjectIdString",
    "bookId": "ObjectIdString"
  }

Rules:
- Validate ObjectId strings.
- User must exist.
- Book must exist.
- Book must have availableCopies > 0.
- Decrement availableCopies by 1 using findOneAndUpdate (atomic update).
- Insert loan with:
  - loanDate = now
  - returnDate = null
  - status = "OPEN"

Example request:
  POST /api/loans

Example request body:
  {
    "userId": "693ceb8ba4faceab45ed4140",
    "bookId": "693ceb8ba4faceab45ed4142"
  }

Success response example:
  {
    "data": {
      "_id": "ObjectIdString",
      "userId": "ObjectIdString",
      "bookId": "ObjectIdString",
      "loanDate": "ISODateString",
      "returnDate": null,
      "status": "OPEN"
    }
  }

Error codes:
- VALIDATION_ERROR
- USER_NOT_FOUND
- BOOK_NOT_FOUND
- NO_COPIES_AVAILABLE
- INTERNAL_ERROR

Example error response:
  {
    "error": {
      "code": "NO_COPIES_AVAILABLE",
      "message": "No copies available for this book."
    }
  }

4) GET /api/stats/top-books

Purpose: statistics (most loaned books)
MongoDB: aggregate using $group, $sort, optionally $lookup to join with books

Aggregation:
- $group by bookId and count loans
- $sort by loanCount descending
- $lookup from books to attach book details (by _id)

Example request:
  GET /api/stats/top-books

Success response example:
  {
    "data": [
      {
        "bookId": "ObjectIdString",
        "loanCount": 0,
        "book": {
          "_id": "ObjectIdString",
          "title": "string",
          "author": "string",
          "tags": ["string"],
          "availableCopies": 0
        }
      }
    ]
  }

Error response example:
  {
    "error": { "code": "INTERNAL_ERROR", "message": "Unexpected server error." }
  }


