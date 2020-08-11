const passport = require('passport');
const Client = require('./../models/clientModel');

/*
 * Simple informational end point, if you want to get information
 * about a particular client.  You would call this with an access token
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
 */
exports.info = [
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    res.json({ client_id: req.user.id, name: req.user.name, scope: req.authInfo.scope });
  }
];

// manual approach
exports.find = async id => {
  return await Client.findOne({ _id: id }, function(err, item) {
    console.log('Client find err:', err);
    if (err) return err;
    return item;
  });
};
exports.findByClientId = async clientId => {
  return await Client.findOne({ clientId: clientId }, function(err, item) {
    console.log('Client findByClientId err:', err);
    if (err) return err;
    return item;
  });
};
