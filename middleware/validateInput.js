export const validateInput = (req, res, next) => {
  // Basic input validation
  if (req.method === 'POST') {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ message: 'Request body is required' });
    }
  }
  next();
};