const {
  USER_ROLES,
  USER_STATUSES,
  RECORD_TYPES,
} = require('./constants');
const { AppError } = require('./http');

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const assertNonEmptyString = (value, field, maxLength = 255) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, `${field} is required`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AppError(400, `${field} must be at most ${maxLength} characters`);
  }

  return trimmed;
};

const assertOptionalString = (value, field, maxLength = 255) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(400, `${field} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AppError(400, `${field} must be at most ${maxLength} characters`);
  }

  return trimmed || null;
};

const assertEmail = (email) => {
  const normalized = assertNonEmptyString(email, 'Email').toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized)) {
    throw new AppError(400, 'Email is invalid');
  }

  return normalized;
};

const assertPassword = (password, { required = true } = {}) => {
  if (!required && password === undefined) {
    return undefined;
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }

  if (password.length > 128) {
    throw new AppError(400, 'Password must be at most 128 characters');
  }

  return password;
};

const assertRole = (role, { required = true } = {}) => {
  if (!required && role === undefined) {
    return undefined;
  }

  if (!USER_ROLES.includes(role)) {
    throw new AppError(400, `Role must be one of: ${USER_ROLES.join(', ')}`);
  }

  return role;
};

const assertStatus = (status, { required = true } = {}) => {
  if (!required && status === undefined) {
    return undefined;
  }

  if (!USER_STATUSES.includes(status)) {
    throw new AppError(400, `Status must be one of: ${USER_STATUSES.join(', ')}`);
  }

  return status;
};

const assertAmount = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError(400, 'Amount must be a positive number');
  }

  return Number(numericAmount.toFixed(2));
};

const assertRecordType = (type, { required = true } = {}) => {
  if (!required && type === undefined) {
    return undefined;
  }

  if (!RECORD_TYPES.includes(type)) {
    throw new AppError(400, `Type must be one of: ${RECORD_TYPES.join(', ')}`);
  }

  return type;
};

const assertDate = (value, field = 'Date') => {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw new AppError(400, `${field} is invalid`);
  }

  return date;
};

const parsePagination = (query, { defaultLimit = 10, maxLimit = 50 } = {}) => {
  const rawPage = query.page ?? 1;
  const rawLimit = query.limit ?? defaultLimit;
  const page = Number.parseInt(rawPage, 10);
  const limit = Number.parseInt(rawLimit, 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError(400, 'Page must be a positive integer');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw new AppError(400, `Limit must be between 1 and ${maxLimit}`);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const parsePositiveInteger = (value, field, { min = 1, max = 100 } = {}) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new AppError(400, `${field} must be between ${min} and ${max}`);
  }

  return parsed;
};

const validateRecordPayload = (payload, { partial = false } = {}) => {
  const data = {};

  if (!partial || hasOwn(payload, 'amount')) {
    data.amount = assertAmount(payload.amount);
  }

  if (!partial || hasOwn(payload, 'type')) {
    data.type = assertRecordType(payload.type);
  }

  if (!partial || hasOwn(payload, 'category')) {
    data.category = assertNonEmptyString(payload.category, 'Category', 80);
  }

  if (!partial || hasOwn(payload, 'date')) {
    data.date = assertDate(payload.date);
  }

  if (!partial || hasOwn(payload, 'notes')) {
    data.notes = assertOptionalString(payload.notes, 'Notes', 500);
  }

  if (!partial || hasOwn(payload, 'userId')) {
    if (payload.userId === undefined || payload.userId === null || payload.userId === '') {
      data.userId = undefined;
    } else {
      data.userId = assertNonEmptyString(payload.userId, 'User ID', 120);
    }
  }

  if (partial && Object.keys(data).length === 0) {
    throw new AppError(400, 'At least one field is required for update');
  }

  return data;
};

const validateUserPayload = (payload, { partial = false } = {}) => {
  const data = {};

  if (!partial || hasOwn(payload, 'name')) {
    data.name = assertNonEmptyString(payload.name, 'Name', 120);
  }

  if (!partial || hasOwn(payload, 'email')) {
    data.email = assertEmail(payload.email);
  }

  if (!partial || hasOwn(payload, 'password')) {
    data.password = assertPassword(payload.password, { required: !partial });
  }

  if (!partial || hasOwn(payload, 'role')) {
    data.role = assertRole(payload.role);
  }

  if (!partial || hasOwn(payload, 'status')) {
    data.status = assertStatus(payload.status);
  }

  if (partial && Object.keys(data).length === 0) {
    throw new AppError(400, 'At least one field is required for update');
  }

  return data;
};

module.exports = {
  assertDate,
  assertEmail,
  assertPassword,
  assertRole,
  assertStatus,
  assertAmount,
  assertRecordType,
  assertNonEmptyString,
  parsePagination,
  parsePositiveInteger,
  validateRecordPayload,
  validateUserPayload,
};
