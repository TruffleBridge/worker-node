import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbPassword =
  process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'database_name',
  process.env.DB_USER || 'root',
  dbPassword,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export default sequelize;
