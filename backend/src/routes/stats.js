const express = require("express");
const router = express.Router();

router.get("/top-books", async (req, res, next) => {
  try {
    const loans = req.app.locals.loans;

    const pipeline = [
      { $group: { _id: "$bookId", loanCount: { $sum: 1 } } },
      { $sort: { loanCount: -1 } },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" }
    ];

    const docs = await loans.aggregate(pipeline).toArray();

    const data = docs.map((d) => ({
      bookId: d._id.toString(),
      loanCount: d.loanCount,
      book: {
        _id: d.book._id.toString(),
        title: d.book.title,
        author: d.book.author,
        tags: d.book.tags,
        availableCopies: d.book.availableCopies
      }
    }));

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
