export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Please login to continue" });
};

export const optionalAuth = (req, res, next) => {
  // This middleware allows both authenticated and non-authenticated users
  next();
};