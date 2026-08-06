import { ApiError } from '../utils/apiError.js';

/**
 * Validates a request field against a zod schema and replaces it with the
 * parsed (coerced) result. Usage: `validate(schema.body, 'body')`.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    if (!schema) return next();

    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', errors));
    }

    req[source] = result.data;
    return next();
  };
}
