module.exports = (err, req, res, next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Unexpected server error.";

  res.status(status).json({
    error: { code, message }
  });
};
