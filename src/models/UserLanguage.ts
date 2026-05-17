import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class UserLanguage extends Model {
  static associate(): void {
    const { User, Language } = sequelize.models;
    if (!User || !Language) {
      return;
    }

    UserLanguage.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });

    UserLanguage.belongsTo(Language, {
      foreignKey: 'languageId',
      as: 'language',
    });
  }

  public id!: number;
  public userId!: number;
  public languageId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserLanguage.init(
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
    languageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'UserLanguage',
    timestamps: true,
  }
);

export default UserLanguage;
