const mongoose = require('mongoose');

// Route param handler — rejects malformed MongoDB ids with 404 instead of a CastError 500
const validateId = (req, res, next, value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
};

module.exports = { validateId };
