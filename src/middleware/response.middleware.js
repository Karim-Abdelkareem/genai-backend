export function attachResponseHelpers(req, res, next) {
  res.ok = (message = "OK", data = null) =>
    res.status(200).json({ success: true, message, data });
  res.created = (message = "Created", data = null) =>
    res.status(201).json({ success: true, message, data });
  res.noContent = () => res.status(204).send();
  next();
}
