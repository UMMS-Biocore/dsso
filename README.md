# Dlogin Server - Authorization server

## Initial Setup:

1. Create certificates by running following commands:

```
mkdir certs
openssl genrsa -out certs/privatekey.pem 2048
openssl req -new -key certs/privatekey.pem -out certs/certrequest.csr
openssl x509 -req -in certs/certrequest.csr -signkey certs/privatekey.pem -out certs/certificate.pem
```

2. Copy `docs/template.config.env` to parent directory as `config.env` and adjust its parameters.

```
cp docs/template.config.env config.env
```

3. Install node modules using npm.

```
npm install
```

## Starting Server:

```
npm run start
```
