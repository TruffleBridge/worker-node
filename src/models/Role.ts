import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Role extends Model {
  static associate(): void {
    const { User, UserRole } = sequelize.models;
    if (!User || !UserRole) {
      return;
    }

    Role.belongsToMany(User, {
      through: UserRole,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'users',
    });
  }

  public id!: number;
  public name!: string;
  public status!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'Role',
    timestamps: true,
  }
);

export default Role;
