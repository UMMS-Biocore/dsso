// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

const login = require('connect-ensure-login');
const oauth2orize = require('oauth2orize');
const passport = require('passport');
const utils = require('./utils');
const validate = require('./validate');
const Client = require('./../models/clientModel');
const authCodes = require('./../controllers/authCodeController.js');
const accessTokens = require('./../controllers/accessTokenController.js');
const refreshTokens = require('./../controllers/refreshTokenController.js');
const clients = require('./../controllers/clientController.js');
const User = require('./../models/userModel');

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Configured expiresIn
const expiresIn = { expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN };

/**
 * Grant authorization codes
 *
 * The callback takes the `client` requesting authorization, the `redirectURI`
 * (which is used as a verifier in the subsequent exchange), the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a code,
 * which is bound to these values, and will be exchanged for an access token.
 */
server.grant(
  oauth2orize.grant.code(async (client, redirectURI, user, ares, done) => {
    console.log('oauth2orize.grant.code');
    try {
      const code = utils.createToken({
        sub: user._id,
        exp: process.env.CODE_TOKEN_EXPIRES_IN
      });
      await authCodes.save(code, client._id, redirectURI, user._id, client.scope);
      done(null, code);
    } catch (err) {
      done(err);
    }
  })
);

/**
 * Grant implicit authorization.
 *
 * The callback takes the `client` requesting authorization, the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a token,
 * which is bound to these values.
 */
server.grant(
  oauth2orize.grant.token(async (client, user, ares, done) => {
    console.log('oauth2orize.grant.token');
    try {
      const token = utils.createToken({
        sub: user._id,
        exp: process.env.ACCESS_TOKEN_EXPIRES_IN
      });
      const expiration = utils.calculateExpirationDate();
      console.log('token: ', token);
      await accessTokens.save(token, expiration, user._id, client._id, client.scope);
      done(null, token, expiresIn);
    } catch (err) {
      done(err);
    }
  })
);

/**
 * Exchange authorization codes for access tokens.
 *
 * The callback accepts the `client`, which is exchanging `code` and any
 * `redirectURI` from the authorization request for verification.  If these values
 * are validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(
  oauth2orize.exchange.code(async (client, code, redirectURI, done) => {
    console.log('oauth2orize.exchange.code');
    try {
      const authCode = await authCodes.delete(code);
      const validated = validate.authCode(code, authCode, client, redirectURI);
      if (!validated) return done(false);
      const tokens = await validate.generateTokens(validated);
      if (tokens.length === 1) {
        return done(null, tokens[0], null, expiresIn);
      }
      if (tokens.length === 2) {
        return done(null, tokens[0], tokens[1], expiresIn);
      }
      throw new Error('Error exchanging auth code for tokens');
    } catch (err) {
      done(err);
    }
  })
);

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(
  oauth2orize.exchange.password(async (client, username, password, scope, done) => {
    console.log('oauth2orize.exchange.password');
    try {
      const user = await User.findOne({ username }).select('+password');
      if (!user || !(await user.correctPassword(password, user.password))) {
        return done(null, false);
      }

      const tokens = await validate.generateTokens({
        scope,
        userID: user._id,
        clientID: client._id
      });
      if (tokens.length === 1) {
        return done(null, tokens[0], null, expiresIn);
      }
      if (tokens.length === 2) {
        return done(null, tokens[0], tokens[1], expiresIn);
      }
      throw new Error('Error exchanging password for tokens');
    } catch (err) {
      done(null, false);
    }
  })
);

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(
  oauth2orize.exchange.clientCredentials(async (client, scope, done) => {
    console.log('oauth2orize.exchange.clientCredentials');
    try {
      const token = utils.createToken({
        sub: client._id,
        exp: process.env.ACCESS_TOKEN_EXPIRES_IN
      });
      const expiration = utils.calculateExpirationDate();
      await accessTokens.save(token, expiration, null, client._id, scope);
      done(null, token, null, expiresIn);
    } catch (err) {
      done(err);
    }
  })
);

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(
  oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
    console.log('oauth2orize.exchange.refreshToken');
    try {
      const foundRefreshToken = await refreshTokens.find(refreshToken);
      const validated = validate.refreshToken(foundRefreshToken, refreshToken, client);
      if (!validated) return done(null, false);
      const token = await validate.generateTokens(foundRefreshToken);
      done(null, token, null, expiresIn);
    } catch {
      done(null, false);
    }
  })
);

/*
 * User authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
const checkLoggedIn = () => {
  return function(req, res, next) {
    console.log(req.user);
    console.log(req.query);
    const redirectOriginal = req.query.redirect_original;
    if (req.user) {
      //user signed in
      next();
    } else {
      res.redirect(redirectOriginal);
    }
  };
};

exports.check_authorization = [
  checkLoggedIn(),
  server.authorization(async (clientID, redirectURI, scope, done) => {
    console.log('server.authorization');
    console.log('clientID', clientID);
    console.log('redirectURI', redirectURI);
    try {
      const client = await clients.findByClientId(clientID);
      if (client) {
        client.scope = scope;
        // WARNING: For security purposes, it is highly advisable to check that
        // redirectURI provided by the client matches one registered with the server.
      }
      return done(null, client, redirectURI);
    } catch (err) {
      done(err);
    }
  }),
  async (req, res, next) => {
    console.log('render dialog');
    // Render the decision dialog if the client isn't a trusted client
    // TODO:  Make a mechanism so that if this isn't a trusted client, the user can record that
    // they have consented but also make a mechanism so that if the user revokes access to any of
    // the clients then they will have to re-consent.
    try {
      const client = await clients.findByClientId(req.query.client_id);
      if (client != null && client.trustedClient && client.trustedClient === true) {
        // This is how we short call the decision like the dialog below does
        server.decision({ loadTransaction: false }, (serverReq, callback) => {
          callback(null, { allow: true });
        })(req, res, next);
      } else {
        res.render('dialog', {
          transactionID: req.oauth2.transactionID,
          user: req.user,
          client: req.oauth2.client
        });
      }
    } catch {
      res.render('dialog', {
        transactionID: req.oauth2.transactionID,
        user: req.user,
        client: req.oauth2.client
      });
    }
  }
];

exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization(async (clientID, redirectURI, scope, done) => {
    console.log('server.authorization');
    try {
      const client = await clients.findByClientId(clientID);
      if (client) {
        client.scope = scope;
        // WARNING: For security purposes, it is highly advisable to check that
        // redirectURI provided by the client matches one registered with the server.
      }
      return done(null, client, redirectURI);
    } catch (err) {
      done(err);
    }
  }),
  async (req, res, next) => {
    console.log('render dialog');
    // Render the decision dialog if the client isn't a trusted client
    // TODO:  Make a mechanism so that if this isn't a trusted client, the user can record that
    // they have consented but also make a mechanism so that if the user revokes access to any of
    // the clients then they will have to re-consent.
    try {
      const client = await clients.findByClientId(req.query.client_id);
      if (client != null && client.trustedClient && client.trustedClient === true) {
        // This is how we short call the decision like the dialog below does
        server.decision({ loadTransaction: false }, (serverReq, callback) => {
          callback(null, { allow: true });
        })(req, res, next);
      } else {
        res.render('dialog', {
          transactionID: req.oauth2.transactionID,
          user: req.user,
          client: req.oauth2.client
        });
      }
    } catch {
      res.render('dialog', {
        transactionID: req.oauth2.transactionID,
        user: req.user,
        client: req.oauth2.client
      });
    }
  }
];

/**
 * User decision endpoint
 *
 * `decision` middleware processes a user's decision to allow or deny access
 * requested by a client application.  Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
exports.decision = [login.ensureLoggedIn(), server.decision()];

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], {
    session: false
  }),
  server.token(),
  server.errorHandler()
];

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => {
  console.log('serializeClient', client);
  done(null, client._id);
});

server.deserializeClient(async (id, done) => {
  console.log('deserializeClient');
  try {
    const client = await Client.findOne({ _id: id });
    if (!client) {
      return done(null);
    }
    done(null, client);
  } catch (err) {
    done(err);
  }
});
