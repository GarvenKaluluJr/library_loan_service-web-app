const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const books = req.app.locals.books;

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : "";

    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ title: re }, { author: re }];
    }
    if (tag) {
      filter.tags = tag;
    }

    const docs = await books.find(filter).limit(200).toArray();

    const data = docs.map((b) => ({
      _id: b._id.toString(),
      title: b.title,
      author: b.author,
      tags: b.tags,
      availableCopies: b.availableCopies
    }));

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
