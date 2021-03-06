const crypto = require('crypto');
const passport = require('passport');
const url = require('url');
// const request = require('request');
// const { get, post } = require('request');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const oauth2 = require('./../utils/oauth2');

// const [getAsync, postAsync] = [get, post].map(promisify);

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt-dsso', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const sendTokenCookie = (token, req, res) => {
  res.cookie('jwt-dsso', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: `${req.body.firstname} ${req.body.lastname}`,
    username: req.body.username,
    email: req.body.email,
    lab: req.body.lab,
    institute: req.body.institute,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  // 2) Generate the random email validation token
  const validationToken = newUser.createEmailValidationToken();
  await newUser.save({ validateBeforeSave: false });

  const confirmUrl = `${process.env.BASE_URL}/verifyEmail?token=${validationToken}`;

  await new Email(newUser, confirmUrl).sendConfirmMessage();

  createSendToken(newUser, 201, req, res);
});

/**
 * Authenticate normal login page using strategy of authenticate
 */
// exports.login = [
//   passport.authenticate('local', {
//     successReturnToOrRedirect: '/',
//     failureRedirect: '/login'
//   })
// ];

exports.login = (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      const message = info && info.message ? info.message : '';
      const logintype = req.session.returnTo ? 'sso' : 'local';
      return res.render('login', {
        title: 'Log into your account',
        message: message,
        logintype: logintype
      });
    }
    req.logIn(user, function(err2) {
      if (err2) {
        return next(err2);
      }
      if (req.session.returnTo) {
        return res.redirect(req.session.returnTo);
      }
      const token = signToken(user._id);
      sendTokenCookie(token, req, res);
      return res.redirect('/');
    });
  })(req, res, next);
};

exports.googleLogin = [passport.authenticate('google', { scope: ['profile', 'email'] })];

exports.googleLoginCallback = [
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res, next) {
    // Successful authentication, redirect success.
    // retrieve params from req.session.returnTo
    if (req.session.returnTo) {
      // eslint-disable-next-line node/no-deprecated-api
      const queryData = url.parse(req.session.returnTo, true).query;
      console.log(queryData);
      req.query = {
        redirect_uri: queryData.redirect_uri,
        response_type: queryData.response_type,
        client_id: queryData.client_id,
        scope: queryData.scope
      };
      next();
    } else {
      if (req.user && req.user._id) {
        const token = signToken(req.user._id);
        sendTokenCookie(token, req, res);
      }
      res.redirect('/');
    }
  },
  oauth2.check_authorization
];

// remove returnTo for local login
exports.removeReturnTo = catchAsync(async (req, res, next) => {
  req.session.returnTo = '';
  next();
});

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = (req, res) => {
  res.cookie('jwt-dsso', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  let redirect = '/';
  if (req.query && req.query.redirect_uri) {
    redirect = req.query.redirect_uri;
  }
  console.log('redirect', redirect);
  req.logout();
  res.redirect(redirect);
};

// isLoggedIn or isLoggedInView should be executed before this middleware
exports.requireLogin = catchAsync(async (req, res, next) => {
  if (!res.locals.user)
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies['jwt-dsso']) {
    token = req.cookies['jwt-dsso'];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; //alias for req.session.user
  res.locals.user = currentUser; // variables that used in the view while rendering (eg.pug)
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies['jwt-dsso'] && req.cookies['jwt-dsso'] != 'loggedout') {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(req.cookies['jwt-dsso'], process.env.JWT_SECRET);
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

exports.verifyEmail = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.query.token)
    .digest('hex');
  console.log(hashedToken);

  // Model.collection skips pre hooks to find inactive user
  const user = await User.collection.findOne({
    emailConfirm: hashedToken
  });

  // 2) Remove emailConfirm
  if (!user) {
    return next(new AppError('Token is invalid.', 400));
  }
  // User.updateOne skips pre hooks to update inactive user
  await User.updateOne(
    { _id: user._id },
    {
      emailConfirm: undefined,
      active: true
    }
  );

  // 3) Generate the random email validation token
  // const adminToken = newUser.createAdminValidationToken();
  // await newUser.save({ validateBeforeSave: false });

  // const confirmUrl = `${req.protocol}://${req.get('host')}/verifyAccount?token=${adminToken}`;

  // await new Email(newUser, confirmUrl).sendAdminConfirm();

  res.locals.emailConfirm = true;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!'), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
