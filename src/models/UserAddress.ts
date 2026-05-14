import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class UserAddress extends Model {
  public id!: number;
  public userId!: number;
  public street1!: string;
  public street2!: string | null;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public latitude!: string;
  public longitude!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserAddress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    street1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    street2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'UserAddress',
    timestamps: true,
  }
);

export default UserAddress;
