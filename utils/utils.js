const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

/** Private certificate used for signing JSON WebTokens */
const privateKey = fs.readFileSync(path.join(__dirname, './../' + process.env.CERTS_PRIVATE_KEY));

/** Public certificate used for verification.  Note: you could also use the private key */
const publicKey = fs.readFileSync(path.join(__dirname, './../' + process.env.CERTS_CERTIFICATE));

/**
 * Creates a signed JSON WebToken and returns it.  Utilizes the private certificate to create
 * the signed JWT.  For more options and other things you can change this to, please see:
 * https://github.com/auth0/node-jsonwebtoken
 *
 * @param  {Number} exp - The number of seconds for this token to expire.  By default it will be 60
 *                        minutes (3600 seconds) if nothing is passed in.
 * @param  {String} sub - The subject or identity of the token.
 * @return {String} The JWT Token
 */
exports.createToken = ({ sub = '', exp = 60 } = {}) => {
  const token = jwt.sign(
    {
      jti: uuidv4(),
      sub,
      exp: Math.floor(Date.now() / 1000) + exp * 1
    },
    privateKey,
    {
      algorithm: 'RS256'
    }
  );

  return token;
};

/**
 * Verifies the token through the jwt library using the public certificate.
 * @param   {String} token - The token to verify
 * @throws  {Error} Error if the token could not be verified
 * @returns {Object} The token decoded and verified
 */
exports.verifyToken = token => {
  console.log('verifyToken', token);
  jwt.verify(token, publicKey);
  console.log('token Verified');
};

exports.calculateExpirationDate = () => {
  return new Date(Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN * 1000);
};

/**
 * Return a random int, used by `utils.uid()`
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Return a unique identifier with the given `len`.
 *     utils.uid(10); => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  const buf = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlen = chars.length;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};
