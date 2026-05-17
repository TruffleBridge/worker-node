import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { AuthProvider } from '../types/auth.js';

class User extends Model {
  static associate(): void {
    const { UserAddress, Language, Role, UserRole, UserLanguage } = sequelize.models;

    if (!UserAddress || !Language || !Role || !UserRole || !UserLanguage) {
      return;
    }

    User.hasMany(UserAddress, {
      foreignKey: 'userId',
      as: 'addresses',
    });

    User.belongsToMany(Language, {
      through: UserLanguage,
      foreignKey: 'userId',
      otherKey: 'languageId',
      as: 'languages',
    });

    User.belongsToMany(Role, {
      through: UserRole,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles',
    });
  }

  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phone!: string | null;
  public password!: string | null;
  public authProvider!: AuthProvider;
  public providerId!: string | null;
  public profilePicture!: string | null;
  public emailVerified!: boolean;
  public activeStatus!: boolean;
  public deleteStatus!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google', 'facebook'),
      allowNull: false,
      defaultValue: 'local',
    },
    providerId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    activeStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    deleteStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'User',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['authProvider', 'providerId'],
        name: 'user_auth_provider_provider_id_unique',
      },
    ],
  }
);

export default User;
