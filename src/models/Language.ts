import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Language extends Model {
  static associate(): void {
    const { User, UserLanguage } = sequelize.models;
    if (!User || !UserLanguage) {
      return;
    }

    Language.belongsToMany(User, {
      through: UserLanguage,
      foreignKey: 'languageId',
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

Language.init(
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
    tableName: 'Language',
    timestamps: true,
  }
);

export default Language;
