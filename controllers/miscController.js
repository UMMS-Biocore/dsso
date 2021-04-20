const ini = require('ini');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const util = require('util');
// const axios = require('axios');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getChangeLog = catchAsync(async (req, res, next) => {
  const doc = fs.readFileSync(path.join(__dirname, './../NEWS'), 'utf8');
  res.status(200).json({
    status: 'success',
    data: JSON.stringify(doc)
  });
});

const getMysqlDnextUsers = async config => {
  const con = mysql.createConnection({
    database: config.Dolphinnext.DB,
    host: config.Dolphinnext.DBHOST,
    port: config.Dolphinnext.DBPORT,
    user: config.Dolphinnext.DBUSER,
    password: config.Dolphinnext.DBPASS
  });

  // node native promisify
  const query = util.promisify(con.query).bind(con);
  const rows = await query('SELECT * FROM `users` WHERE active = 1 AND deleted = 0');
  con.end();
  return rows;
};

const getUserId = (users, email) => {
  if (!email) return 0;
  let check = users.find(o => o.email.toLowerCase() === email.toLowerCase());
  if (check) return check._id;
  return 0;
};
const checkUserExist = (users, email) => {
  if (!email) return 0;
  let check = users.find(o => o.email.toLowerCase() === email.toLowerCase());
  if (check) return 1;
  return 0;
};
exports.importDnextUsers = catchAsync(async (req, res, next) => {
  if (!req.body.secFilePath) return next(new AppError(`secFilePath not found!`, 404));
  if (!req.body.userlist) return next(new AppError(`userlist not found!`, 404));

  const conf = fs.readFileSync(req.body.secFilePath, 'utf8');
  if (!conf) return next(new AppError(`Sec file not found!`, 404));
  const config = ini.parse(conf);
  if (!config.Dolphinnext) return next(new AppError(`Dolphinnext section not found!`, 404));
  if (!config.Dolphinnext.DB) return next(new AppError(`DB data not found!`, 404));
  if (!config.Dolphinnext.DBUSER) return next(new AppError(`DBUSER data not found!`, 404));
  if (!config.Dolphinnext.DBPASS) return next(new AppError(`DBPASS data not found!`, 404));
  if (!config.Dolphinnext.DBHOST) return next(new AppError(`DBHOST data not found!`, 404));
  if (!config.Dolphinnext.DBPORT) return next(new AppError(`DBPORT data not found!`, 404));
  if (!config.Dolphinnext.SALT) return next(new AppError(`SALT data not found!`, 404));
  if (!config.Dolphinnext.PEPPER) return next(new AppError(`PEPPER data not found!`, 404));

  const doc = [];
  const rows = await getMysqlDnextUsers(config);
  const users = await User.find({}).exec();
  for (let i = 0; i < rows.length; i++) {
    if (req.body.userlist.includes(rows[i].id)) {
      const exist = checkUserExist(users, rows[i].email);
      let user = {};
      user.id = rows[i].id;
      user.name = rows[i].name;
      user.username = rows[i].username;
      user.email = rows[i].email;
      user.institute = rows[i].institute;
      user.lab = rows[i].lab;
      user.role = rows[i].role;
      user.loginType = rows[i].logintype;
      user.password = rows[i].pass_hash;
      user.active = true;
      if (!exist) {
        //insert
        try {
          // eslint-disable-next-line no-await-in-loop
          const newUser = await User.create(user);
          const userId = newUser._id;
          // use findByIdAndUpdate to save password hash without additional hasing in the model
          // eslint-disable-next-line no-await-in-loop
          await User.findByIdAndUpdate(
            userId,
            { $set: user },
            {
              new: true,
              runValidators: true,
              context: 'query'
            }
          );
          doc.push(1);
        } catch (err) {
          doc.push(err);
        }
      } else {
        //update
        const userId = getUserId(users, rows[i].email);
        try {
          // eslint-disable-next-line no-await-in-loop
          await User.findByIdAndUpdate(
            userId,
            { $set: user },
            {
              new: true,
              runValidators: true,
              context: 'query'
            }
          );
          doc.push(1);
        } catch (err) {
          doc.push(err);
        }
      }

      //5316e50b3a728ce064e60be55b068c7e
      //bc09a0783e475acbb0e9cc6c88914b456fd4dc62d4741e2892ba3534c12e7b81
      //bc09a0783e475acbb0e9cc6c88914b456fd4dc62d4741e2892ba3534c12e7b81
    }
  }
  res.status(200).json({
    status: 'success',
    reqeustedAt: req.requestTime,
    data: {
      data: doc
    }
  });
});

exports.getDnextUsers = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.secFilePath) return next(new AppError(`secFilePath not found!`, 404));
    const conf = fs.readFileSync(req.body.secFilePath, 'utf8');
    if (!conf) return next(new AppError(`Sec file not found!`, 404));
    const config = ini.parse(conf);
    if (!config.Dolphinnext) return next(new AppError(`Dolphinnext section not found!`, 404));
    if (!config.Dolphinnext.DB) return next(new AppError(`DB data not found!`, 404));
    if (!config.Dolphinnext.DBUSER) return next(new AppError(`DBUSER data not found!`, 404));
    if (!config.Dolphinnext.DBPASS) return next(new AppError(`DBPASS data not found!`, 404));
    if (!config.Dolphinnext.DBHOST) return next(new AppError(`DBHOST data not found!`, 404));
    if (!config.Dolphinnext.DBPORT) return next(new AppError(`DBPORT data not found!`, 404));

    const rows = await getMysqlDnextUsers(config);
    let doc = [];
    const users = await User.find({}).exec();

    for (let i = 0; i < rows.length; i++) {
      let user = {};
      user.id = rows[i].id;
      user.name = rows[i].name;
      user.username = rows[i].username;
      user.email = rows[i].email;
      user.institute = rows[i].institute;
      user.lab = rows[i].lab;
      user.role = rows[i].role;
      user.loginType = rows[i].logintype;
      user.exist = checkUserExist(users, rows[i].email);
      doc.push(user);
    }

    res.status(200).json({
      status: 'success',
      reqeustedAt: req.requestTime,
      data: {
        data: doc
      }
    });
  } catch (err) {
    next(new AppError(`Error occured! ${err}`, 404));
  }
});
