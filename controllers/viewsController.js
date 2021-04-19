const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('overview', {
    title: 'Overview'
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    logintype: 'sso',
    title: 'Log into your account'
  });
};

exports.getLocalLoginForm = (req, res) => {
  res.status(200).render('login', {
    logintype: 'local',
    title: 'Log into your account'
  });
};

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).render('profile', {
    title: 'Profile'
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.verifyEmail = (req, res) => {
  res.status(200).render('verifyEmail', {
    title: 'E-mail verification'
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
