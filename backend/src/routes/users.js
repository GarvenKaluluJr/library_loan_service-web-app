const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = req.app.locals.users;

    const docs = await users.find({}).limit(200).toArray();

    const data = docs.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt // will serialize to ISO string in JSON
    }));

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
