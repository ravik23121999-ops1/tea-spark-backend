const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/helpers");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return sendResponse(res, 401, false, "No token provided");

    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return sendResponse(res, 403, false, "Access denied");
      }

      next();
    } catch (err) {
      return sendResponse(res, 401, false, "Invalid token");
    }
  };
};

module.exports = authMiddleware;
