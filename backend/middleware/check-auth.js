const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authntication Failed");
    }

    const decoded = jwt.verify(token, "supertejasjagtap");
    req.userData = { userId: decoded.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authntication Failed", 401);
    return next(error);
  }
};
