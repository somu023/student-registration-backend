module.exports = (req, res, next) => {
  const origin = req.get('origin');
  if (origin === process.env.FRONTEND_ORIGIN) {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized origin' });
  }
};
