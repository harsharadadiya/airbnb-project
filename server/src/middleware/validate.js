// Validates req.body / req.query / req.params with a Zod schema.
// If the data is wrong, the request stops here with a 400 error and a list of problems.
//
// Usage:  router.post('/', validate({ body: createListingSchema }), createListing)
//
// After validation:
//   req.body           -> cleaned body
//   req.validatedQuery -> cleaned query string (Express 5 does not let us overwrite req.query)
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

function formatIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'value',
    message: issue.message,
  }));
}

export function validate(schemas) {
  return (req, _res, next) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body ?? {});
      if (!result.success) throw new AppError('Please fix the highlighted fields', 400, formatIssues(result.error.issues));
      req.body = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query ?? {});
      if (!result.success) throw new AppError('Invalid search options', 400, formatIssues(result.error.issues));
      req.validatedQuery = result.data;
    }
    next();
  };
}

// Checks that :id (or another param) is a real MongoDB ObjectId
export function validateObjectId(paramName = 'id') {
  return (req, _res, next) => {
    if (!mongoose.isValidObjectId(req.params[paramName])) {
      throw new AppError(`Invalid ${paramName}`, 400);
    }
    next();
  };
}
