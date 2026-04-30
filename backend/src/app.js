const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const logger = require('./config/logger');
const apiLimiter = require('./middleware/rateLimiter');
const { requireDatabase } = require('./middleware/requireDatabase');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/apiResponse');
const { getDbStatus } = require('./config/db');

const app = express();

app.set('envIsProduction', env.isProduction);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', requireDatabase, require('./routes/authRoutes'));
app.use('/api/users', requireDatabase, require('./routes/userRoutes'));
app.use('/api/groups', requireDatabase, require('./routes/groupRoutes'));
app.use('/api/media', requireDatabase, require('./routes/mediaRoutes'));
app.use('/api/requests', requireDatabase, require('./routes/requestRoutes'));
app.use('/api/chat', requireDatabase, require('./routes/chatRoutes'));
app.use('/api/notifications', requireDatabase, require('./routes/notificationRoutes'));
app.use('/api/ai', requireDatabase, require('./routes/aiRoutes'));
app.use('/api/match', requireDatabase, require('./routes/matchRoutes'));
app.use('/api/swap', requireDatabase, require('./routes/swapRoutes'));
app.use('/api/review', requireDatabase, require('./routes/reviewRoutes'));


app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SkillSwap API is running'
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
