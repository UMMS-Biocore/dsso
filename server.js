const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const options = {
  key: fs.readFileSync(path.join(__dirname, process.env.CERTS_PRIVATE_KEY)),
  cert: fs.readFileSync(path.join(__dirname, process.env.CERTS_CERTIFICATE))
};

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

// This setting is so that our certificates will work although they are all self signed
// TODO: Remove this if you are NOT using self signed certs
https.globalAgent.options.rejectUnauthorized = false;

// Create our HTTPS server.
const port = process.env.PORT || 3000;
const server = https.createServer(options, app);
server.listen(port, function() {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
