import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class UserRole extends Model {
  public id!: number;
  public userId!: number;
  public roleId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
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
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'UserRole',
    timestamps: true,
  }
);

export default UserRole;
