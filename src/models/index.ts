import type { Model, ModelStatic } from 'sequelize';
import Role from './Role.js';
import Language from './Language.js';
import UserAddress from './UserAddress.js';
import UserLanguage from './UserLanguage.js';
import UserRole from './UserRole.js';
import User from './User.js';

type AssociableModel = ModelStatic<Model> & {
  associate?: () => void;
};

const models: AssociableModel[] = [Role, Language, UserAddress, UserLanguage, UserRole, User];

for (const model of models) {
  model.associate?.();
}

export { User, Role, Language, UserAddress, UserLanguage, UserRole };
