export function validate(schema) {
  return (req, res, next) => {
    if (!schema) return next();
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          errors: error.details,
          data: null,
        });
    }
    req.body = value;
    next();
  };
}
