const jwt = require('jsonwebtoken');
const { AppError, asyncHandler } = require('../lib/http');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
};

const attachCurrentUser = (prisma) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?.id) {
      throw new AppError(401, 'Authentication token is invalid');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'User account no longer exists');
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'User account is inactive');
    }

    req.currentUser = user;
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  });

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};

module.exports = { authenticateJWT, attachCurrentUser, authorizeRole };
