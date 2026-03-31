export function validate(schema) {
  return (req, res, next) => {
    try {
      const data = schema.parse(req.body);
      req.validatedBody = data;
      next();
    } catch (err) {
      const details = err.errors || err.issues || [];
      const message = details.length > 0
        ? details[0].message
        : err.message || 'Validation failed';
      return res.status(400).json({ error: message, details });
    }
  };
}
