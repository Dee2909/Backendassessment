const bcrypt = require('bcryptjs');
const { attachCurrentUser, authenticateJWT, authorizeRole } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../lib/http');
const { USER_ROLES, USER_STATUSES } = require('../lib/constants');
const { parsePagination, validateUserPayload } = require('../lib/validation');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.use(authenticateJWT, attachCurrentUser(prisma), authorizeRole('Admin'));

  router.get(
    '/summary',
    asyncHandler(async (req, res) => {
      const [totalUsers, activeUsers, inactiveUsers, groupedRoles] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.user.count({ where: { status: 'inactive' } }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { _all: true },
        }),
      ]);

      const byRole = USER_ROLES.reduce((accumulator, role) => {
        const match = groupedRoles.find((entry) => entry.role === role);
        accumulator[role] = match?._count._all ?? 0;
        return accumulator;
      }, {});

      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers,
        byRole,
      });
    })
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { page, limit, skip } = parsePagination(req.query);
      const where = {};

      if (req.query.role) {
        if (!USER_ROLES.includes(req.query.role)) {
          throw new AppError(400, `Role must be one of: ${USER_ROLES.join(', ')}`);
        }
        where.role = req.query.role;
      }

      if (req.query.status) {
        if (!USER_STATUSES.includes(req.query.status)) {
          throw new AppError(400, `Status must be one of: ${USER_STATUSES.join(', ')}`);
        }
        where.status = req.query.status;
      }

      if (req.query.search?.trim()) {
        const search = req.query.search.trim();
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                records: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users: users.map((user) => {
          const { _count, ...rest } = user;
          return {
            ...rest,
            recordCount: _count.records,
          };
        }),
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
    asyncHandler(async (req, res) => {
      const { name, email, password, role, status } = validateUserPayload(req.body);
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        throw new AppError(409, 'Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          status,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      res.status(201).json(user);
    })
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const data = validateUserPayload(req.body, { partial: true });

      if (req.params.id === req.currentUser.id && data.status === 'inactive') {
        throw new AppError(400, 'You cannot deactivate your own account');
      }

      const updateData = { ...data };
      if (updateData.password !== undefined) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      res.json(user);
    })
  );

  return router;
};
