const passport = require('passport');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/**
 * Simple informational end point, if you want to get information
 * about a particular user.  You would call this with an access token
 * in the body of the message according to OAuth 2.0 standards
 * http://tools.ietf.org/html/rfc6750#section-2.1
 *
 * Example would be using the endpoint of
 * https://localhost:3000/api/userinfo
 *
 * With a GET using an Authorization Bearer token similar to
 * GET /api/userinfo
 * Host: https://localhost:3000
 * Authorization: Bearer someAccessTokenHere
 * @param {Object} req The request
 * @param {Object} res The response
 * @returns {undefined}
 */
exports.userinfo = [
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    console.log('req.user', req.user);
    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      scope: req.authInfo.scope
    });
  }
];

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// Do NOT update passwords with this!
exports.createUser = factory.createOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+password');
  if (req.body.password) user.password = req.body.password;
  if (req.body.passwordConfirm) user.passwordConfirm = req.body.passwordConfirm;
  const doc = await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

// manual approach
exports.find = async id => {
  return await User.findOne({ _id: id }, function(err, item) {
    console.log('User find err:', err);
    if (err) return err;
    return item;
  });
};
exports.findByUsername = async username => {
  return await User.findOne({ username: username }, function(err, item) {
    console.log('User findByUsername err:', err);
    if (err) return err;
    return item;
  });
};
