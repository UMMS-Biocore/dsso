const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const mongoose = require('mongoose');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const oauthRouter = require('./routes/oauthRoutes');
const userRouter = require('./routes/userRoutes');
const clientRouter = require('./routes/clientRoutes');
const tokenRouter = require('./routes/tokenRoutes');
const viewRouter = require('./routes/viewRoutes');
const miscRouter = require('./routes/miscRoutes');
const accessTokens = require('./controllers/accessTokenController');

// Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views'); // set basedir for pug

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *

app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// console.log('Using MemoryStore for the data store');
// console.log('Using MemoryStore for the Session');
// const MemoryStore = expressSession.MemoryStore;

// store session in mongodb
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful for session!'));

mongoose.Promise = global.Promise;

// Session Configuration
app.use(
  expressSession({
    saveUninitialized: true,
    resave: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    key: 'dsso_authorization.sid',
    cookie: { maxAge: 3600000 * 24 * 7 * 52 } // a year in ms
  })
);

// WARNING: place the app.use(require('cookie-parser')); app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false })); BEFORE calling the: app.use(passport.initialize()); app.use(passport.session());
app.use(passport.initialize());
app.use(passport.session());
// Passport configuration
require('./utils/auth');

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// Test middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// Clean up expired tokens in the database
setInterval(() => {
  accessTokens.removeExpired(function(err) {
    if (err) {
      console.log('Error removing expired tokens');
    }
  });
}, process.env.TIME_TO_CHECK_EXPIRED_TOKENS * 1000);

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/oauth', oauthRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/clients', clientRouter);
app.use('/api/v1/tokens', tokenRouter);
app.use('/api/v1/misc', miscRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
