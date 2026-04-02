const { DEFAULT_CATEGORIES, RECORD_TYPES } = require('./constants');
const { AppError } = require('./http');
const {
  assertDate,
  assertRecordType,
} = require('./validation');

const buildRecordWhere = (query = {}, { includeSearch = true } = {}) => {
  const where = {};

  if (query.type) {
    where.type = assertRecordType(query.type);
  }

  if (query.category) {
    where.category = query.category.trim();
  }

  if (query.userId) {
    where.userId = query.userId.trim();
  }

  if (query.startDate || query.endDate) {
    const dateFilter = {};

    if (query.startDate) {
      dateFilter.gte = assertDate(query.startDate, 'Start date');
    }

    if (query.endDate) {
      const endDate = assertDate(query.endDate, 'End date');
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
      throw new AppError(400, 'Start date must be before end date');
    }

    where.date = dateFilter;
  }

  if (includeSearch && query.search && query.search.trim()) {
    const search = query.search.trim();
    where.OR = [
      { category: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return where;
};

const normalizeRecord = (record) => ({
  id: record.id,
  userId: record.userId,
  userName: record.user?.name ?? null,
  userEmail: record.user?.email ?? null,
  amount: Number(record.amount),
  type: record.type,
  category: record.category,
  date: record.date,
  notes: record.notes,
  createdAt: record.createdAt,
});

const mergeCategories = (categories = []) => {
  return [...new Set([...DEFAULT_CATEGORIES, ...categories].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
};

module.exports = {
  RECORD_TYPES,
  buildRecordWhere,
  mergeCategories,
  normalizeRecord,
};
