// ============================================================
// middleware/validate.js
//   validate(schema) -> checks req.body with a zod schema. Bad input
//                       becomes a 400 VALIDATION error; good input
//                       replaces req.body with the cleaned values.
//   parseUuid(value) -> returns the id, or throws a 404 if it is not
//                       a valid UUID (so a bad id never reaches the database).
// ============================================================
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body ?? {});
  next();
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUuid(value) {
  if (!UUID_PATTERN.test(value)) throw new AppError(404, 'NOT_FOUND', 'Not found.');
  return value;
}