import { ApiError } from '../utils/apiError.js';

/**
 * Validates a request field against a zod schema and replaces it with the
 * parsed (coerced) result. Usage: `validate(schema.body, 'body')`.
 *
 * In Express 5, `req.query` (and on some versions `req.params`) are getter-only
 * properties, so a direct assignment would throw. When that happens we fall
 * back to merging the parsed fields into the object the getter returns — its
 * own properties are writable, so the request still sees the coerced values.
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

    // Set verified validated properties
    if (source === 'body') {
      req.validatedBody = result.data;
    } else if (source === 'query') {
      req.validatedQuery = result.data;
    } else if (source === 'params') {
      req.validatedParams = result.data;
    }

    // Best-effort mutate standard fields for backward compatibility
    try {
      req[source] = result.data;
    } catch {
      try {
        Object.assign(req[source], result.data);
      } catch {
        // ignore
      }
    }

    return next();
  };
}