const jwt = require("jsonwebtoken");

function createAuthenticate(jwtSecret) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name
      };
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = createAuthenticate;

