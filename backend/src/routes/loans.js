const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

function isValidObjectIdString(s) {
  return typeof s === "string" && ObjectId.isValid(s) && (new ObjectId(s)).toString() === s;
}

router.post("/", async (req, res, next) => {
  try {
    const users = req.app.locals.users;
    const books = req.app.locals.books;
    const loans = req.app.locals.loans;

    const { userId, bookId } = req.body || {};

    if (!isValidObjectIdString(userId) || !isValidObjectIdString(bookId)) {
      const err = new Error("userId and bookId must be valid ObjectId strings.");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const userObjectId = new ObjectId(userId);
    const bookObjectId = new ObjectId(bookId);

    const user = await users.findOne({ _id: userObjectId });
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      err.code = "USER_NOT_FOUND";
      throw err;
    }

    // Atomic decrement only if availableCopies > 0
    const updateResult = await books.findOneAndUpdate(
      { _id: bookObjectId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { returnDocument: "after" }
    );

    if (!updateResult.value) {
      // Distinguish BOOK_NOT_FOUND vs NO_COPIES_AVAILABLE
      const bookExists = await books.findOne({ _id: bookObjectId });
      if (!bookExists) {
        const err = new Error("Book not found.");
        err.status = 404;
        err.code = "BOOK_NOT_FOUND";
        throw err;
      } else {
        const err = new Error("No copies available for this book.");
        err.status = 409;
        err.code = "NO_COPIES_AVAILABLE";
        throw err;
      }
    }

    const loanDoc = {
      userId: userObjectId,
      bookId: bookObjectId,
      loanDate: new Date(),
      returnDate: null,
      status: "OPEN"
    };

    const insertRes = await loans.insertOne(loanDoc);

    res.status(201).json({
      data: {
        _id: insertRes.insertedId.toString(),
        userId,
        bookId,
        loanDate: loanDoc.loanDate,
        returnDate: null,
        status: "OPEN"
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
