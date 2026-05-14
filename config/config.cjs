const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'database_dev',
  database: process.env.DB_NAME || 'database_dev',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  dialectOptions: {
    bigNumberStrings: true,
  },
};