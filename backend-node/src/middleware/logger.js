const { v4: uuidv4 } = require("uuid");

const requestLogger = (req, res, next) => {
  req.requestId = uuidv4();
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(`[${req.requestId.slice(0, 8)}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
};

module.exports = { requestLogger };
