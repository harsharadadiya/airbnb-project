// A custom error with an HTTP status code.
// Throw it anywhere:  throw new AppError('Listing not found', 404)
// The error handler middleware turns it into a clean JSON response.
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional list of field errors: [{ field, message }]
    this.isOperational = true; // "expected" error, safe to show to the user
  }
}
