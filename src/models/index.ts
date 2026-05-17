import User from './User.js';
import UserType from './Role.js';
import Language from './Language.js';
import UserAddress from './UserAddress.js';
import UserLanguage from './UserLanguage.js';
import UserRole from './UserRole.js';

// Associations
User.belongsTo(UserType, {
  foreignKey: 'userTypeId',
  as: 'userType',
});
UserType.hasMany(User, {
  foreignKey: 'userTypeId',
  as: 'users',
});

User.hasMany(UserAddress, {
  foreignKey: 'userId',
  as: 'addresses',
});
UserAddress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.belongsToMany(Language, {
  through: UserLanguage,
  foreignKey: 'userId',
  otherKey: 'languageId',
  as: 'languages',
});
Language.belongsToMany(User, {
  through: UserLanguage,
  foreignKey: 'languageId',
  otherKey: 'userId',
  as: 'users',
});

UserLanguage.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
UserLanguage.belongsTo(Language, {
  foreignKey: 'languageId',
  as: 'language',
});

User.belongsToMany(UserType, {
  through: UserRole,
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles',
});
UserType.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'roleUsers',
});

UserRole.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
UserRole.belongsTo(UserType, {
  foreignKey: 'roleId',
  as: 'role',
});

export { User, UserType, Language, UserAddress, UserLanguage, UserRole };
