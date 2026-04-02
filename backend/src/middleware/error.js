const { Prisma } = require('@prisma/client');
const { AppError } = require('../lib/http');

const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A record with the same unique value already exists' });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Requested resource was not found' });
    }
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
