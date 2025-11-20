/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Handle different content types
  if (req.accepts("html")) {
    return res.status(status).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: system-ui; padding: 40px; text-align: center; }
          h1 { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>${status}</h1>
        <p>${message}</p>
        <a href="/">Go back home</a>
      </body>
      </html>
    `);
  }

  return res.status(status).json({
    success: false,
    message,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};
