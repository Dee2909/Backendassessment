const { attachCurrentUser, authenticateJWT, authorizeRole } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../lib/http');
const { DEFAULT_CATEGORIES } = require('../lib/constants');
const {
  parsePagination,
  parsePositiveInteger,
  validateRecordPayload,
} = require('../lib/validation');
const {
  buildRecordWhere,
  mergeCategories,
  normalizeRecord,
} = require('../lib/records');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.use(authenticateJWT, attachCurrentUser(prisma));

  router.get(
    '/meta',
    asyncHandler(async (req, res) => {
      const recordCategories = await prisma.record.findMany({
        distinct: ['category'],
        select: { category: true },
      });

      res.json({
        categories: mergeCategories(recordCategories.map((entry) => entry.category)),
        suggestedCategories: DEFAULT_CATEGORIES,
      });
    })
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { page, limit, skip } = parsePagination(req.query);
      const where = buildRecordWhere(req.query);

      const [records, total] = await Promise.all([
        prisma.record.findMany({
          where,
          skip,
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
        }),
        prisma.record.count({ where }),
      ]);

      res.json({
        records: records.map(normalizeRecord),
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    })
  );

  router.post(
    '/',
    authorizeRole('Admin'),
    asyncHandler(async (req, res) => {
      const data = validateRecordPayload(req.body);
      const targetUserId = data.userId || req.currentUser.id;

      const owner = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, status: true },
      });

      if (!owner) {
        throw new AppError(404, 'Assigned user was not found');
      }

      if (owner.status !== 'active') {
        throw new AppError(400, 'Assigned user must be active');
      }

      const record = await prisma.record.create({
        data: {
          amount: data.amount,
          type: data.type,
          category: data.category,
          date: data.date,
          notes: data.notes,
          userId: targetUserId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(normalizeRecord(record));
    })
  );

  router.patch(
    '/:id',
    authorizeRole('Admin'),
    asyncHandler(async (req, res) => {
      const data = validateRecordPayload(req.body, { partial: true });

      if (data.userId) {
        const owner = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { id: true, status: true },
        });

        if (!owner) {
          throw new AppError(404, 'Assigned user was not found');
        }

        if (owner.status !== 'active') {
          throw new AppError(400, 'Assigned user must be active');
        }
      }

      const record = await prisma.record.update({
        where: { id: req.params.id },
        data,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.json(normalizeRecord(record));
    })
  );

  router.delete(
    '/:id',
    authorizeRole('Admin'),
    asyncHandler(async (req, res) => {
      await prisma.record.delete({ where: { id: req.params.id } });
      res.json({ message: 'Record deleted successfully' });
    })
  );

  return router;
};
