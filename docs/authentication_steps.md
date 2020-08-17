# Connecting Client Server to Authorization Server:

1. Get CLIENT_ID and CLIENT_SECRET from authorization server.

```
CLIENT_ID=4u4vx320
CLIENT_SECRET=dkaad3dfncl0slwnd
```

2. In the client site, create login button which will redirect users to following link. After users authenticated with their username/password, they will be redirected to \$REDIRECT_URL in the client side.

```
$SSO_URL=https://localhost:3000
$REDIRECT_URL=https://localhost:5000/receivetoken
$SSO_LOGIN_URL = "{$SSO_URL}/dialog/authorize?redirect_uri={$REDIRECT_URL}?response_type=code&client_id={$CLIENT_ID}&scope=offline_access"
```

3. After authentication in authorization server, users will be returned to client side (eg. https://localhost:5000/receivetoken) with autorization code (eg. req.query.code). First client side sends post request to \$SSO_TOKEN_URL of the authorization server (3a).

3a. Post request to \$SSO_TOKEN_URL for access token:

```
$SSO_TOKEN_URL = "{$this->SSO_URL}/api/v1/oauth/token";
$REDIRECT_URL=https://localhost:5000/receivetoken
const { statusCode, body } = await postAsync($SSO_TOKEN_URL, {
      form: {
        code: req.query.code,
        redirect_uri: $REDIRECT_URL,
        client_id: $CLIENT_ID,
        client_secret: $CLIENT_SECRET,
        grant_type: 'authorization_code'
      }
    });
```

3b. Parse accessToken, refreshToken and expiresIn from body.

```
const msg = JSON.parse(body);
const accessToken = msg.access_token;
const refreshToken = msg.refresh_token;
const expiresIn = msg.expires_in;
const expirationDate = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
```

3c. Use accessToken to get user information from \$SSO_USER_INFO_URL api:

```
$SSO_USER_INFO_URL ="{$this->SSO_URL}/api/v1/users/info"
const userInfoObj = await getAsync({
    url: $SSO_USER_INFO_URL,
    headers: {
        Authorization: `Bearer ${accessToken}`
    },
    rejectUnauthorized: false
});
```

4c. Parse user data:

```
const currentUser = JSON.parse(userInfoObj.body);
const userId = currentUser._id;
const scope = currentUser.scope;
const email = currentUser.email;
const username = currentUser.username;
```
