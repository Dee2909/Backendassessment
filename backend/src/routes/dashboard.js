const { attachCurrentUser, authenticateJWT, authorizeRole } = require('../middleware/auth');
const { asyncHandler } = require('../lib/http');
const { buildRecordWhere, normalizeRecord } = require('../lib/records');
const { parsePositiveInteger } = require('../lib/validation');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.use(authenticateJWT, attachCurrentUser(prisma));

  router.get(
    '/summary',
    asyncHandler(async (req, res) => {
      const where = buildRecordWhere(req.query, { includeSearch: false });
      const recentThreshold = new Date();
      recentThreshold.setDate(recentThreshold.getDate() - 30);

      const [incomeAggregate, expenseAggregate, recordCount, recentActivityCount] = await Promise.all([
        prisma.record.aggregate({
          where: { ...where, type: 'income' },
          _sum: { amount: true },
        }),
        prisma.record.aggregate({
          where: { ...where, type: 'expense' },
          _sum: { amount: true },
        }),
        prisma.record.count({ where }),
        prisma.record.count({
          where: {
            ...where,
            date: {
              ...(where.date ?? {}),
              gte: where.date?.gte && where.date.gte > recentThreshold ? where.date.gte : recentThreshold,
            },
          },
        }),
      ]);

      const totalIncome = Number(incomeAggregate._sum.amount ?? 0);
      const totalExpense = Number(expenseAggregate._sum.amount ?? 0);

      res.json({
        totalIncome,
        totalExpense,
        netBalance: Number((totalIncome - totalExpense).toFixed(2)),
        recordCount,
        recentActivityCount,
      });
    })
  );

  router.get(
    '/category',
    authorizeRole('Analyst', 'Admin'),
    asyncHandler(async (req, res) => {
      const rows = await prisma.record.groupBy({
        by: ['category', 'type'],
        where: buildRecordWhere(req.query, { includeSearch: false }),
        _sum: { amount: true },
        _count: { _all: true },
      });

      const grouped = rows.reduce((accumulator, row) => {
        if (!accumulator[row.category]) {
          accumulator[row.category] = {
            category: row.category,
            income: 0,
            expense: 0,
            total: 0,
            transactions: 0,
          };
        }

        const amount = Number(row._sum.amount ?? 0);
        accumulator[row.category][row.type] = amount;
        accumulator[row.category].total += amount;
        accumulator[row.category].transactions += row._count._all;
        return accumulator;
      }, {});

      const result = Object.values(grouped).sort((left, right) => right.total - left.total);
      res.json(result);
    })
  );

  router.get(
    '/monthly',
    authorizeRole('Analyst', 'Admin'),
    asyncHandler(async (req, res) => {
      const months = req.query.months
        ? parsePositiveInteger(req.query.months, 'Months', { min: 1, max: 12 })
        : 6;

      const now = new Date();
      const firstMonth = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
      const where = buildRecordWhere(
        {
          ...req.query,
          startDate: req.query.startDate || firstMonth.toISOString(),
        },
        { includeSearch: false }
      );

      const records = await prisma.record.findMany({
        where,
        select: {
          amount: true,
          type: true,
          date: true,
        },
        orderBy: { date: 'asc' },
      });

      const monthlyMap = new Map();
      for (let index = 0; index < months; index += 1) {
        const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(key, {
          month: key,
          label: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          income: 0,
          expense: 0,
          net: 0,
        });
      }

      records.forEach((record) => {
        const recordDate = new Date(record.date);
        const key = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(key);

        if (!existing) {
          return;
        }

        const amount = Number(record.amount);
        existing[record.type] += amount;
        existing.net = Number((existing.income - existing.expense).toFixed(2));
      });

      res.json(Array.from(monthlyMap.values()));
    })
  );

  router.get(
    '/recent',
    asyncHandler(async (req, res) => {
      const limit = req.query.limit
        ? parsePositiveInteger(req.query.limit, 'Limit', { min: 1, max: 20 })
        : 5;

      const records = await prisma.record.findMany({
        where: buildRecordWhere(req.query),
        take: limit,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.json(records.map(normalizeRecord));
    })
  );

  return router;
};
