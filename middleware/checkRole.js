const User = require("../models/usersModel"); // Import your User model

// Middleware to check user role
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      // Check if userId is present in the request
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No user ID found" });
      }
      // Check if the user exists in the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check if the user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions" });
      }
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };
};

module.exports = checkRole;
