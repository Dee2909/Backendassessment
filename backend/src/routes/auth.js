const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateJWT, attachCurrentUser } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../lib/http');
const {
  assertEmail,
  assertNonEmptyString,
  assertPassword,
} = require('../lib/validation');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const name = assertNonEmptyString(req.body.name, 'Name', 120);
      const email = assertEmail(req.body.email);
      const password = assertPassword(req.body.password);

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
          role: 'Viewer',
          status: 'active',
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

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ user, token });
    })
  );

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const email = assertEmail(req.body.email);
      const password = assertPassword(req.body.password);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      if (user.status !== 'active') {
        throw new AppError(403, 'User account is inactive');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
        token,
      });
    })
  );

  router.get('/me', authenticateJWT, attachCurrentUser(prisma), (req, res) => {
    res.json(req.currentUser);
  });

  return router;
};
