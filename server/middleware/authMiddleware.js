const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.headers["authorization"];
  
  if (!token) return res.status(403).send("Token missing");

  try {
    const decoded = jwt.verify(token, (process.env.JWT_SECRET));
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};
