export function notFoundHandler(req, res, next) {
  return res
    .status(404)
    .json({ success: false, message: "Not Found", data: null });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || undefined;
  return res
    .status(status)
    .json({ success: false, message, errors, data: null });
}
