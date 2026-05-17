import type { Model } from 'sequelize';
import AuthTokenService from '../services/AuthTokenService.js';
import type { AuthPayload } from '../types/auth.js';

function resolveUserId(user: Model | Record<string, unknown>): number {
  const model = user as Model;

  if (typeof model.getDataValue === 'function') {
    const id = model.getDataValue('id');
    if (id != null) {
      return Number(id);
    }
  }

  if (typeof model.get === 'function') {
    const id = model.get('id');
    if (id != null) {
      return Number(id);
    }
  }

  const plain =
    typeof model.toJSON === 'function'
      ? model.toJSON()
      : (user as Record<string, unknown>);

  const id = plain.id;
  if (id == null) {
    throw new Error('User id is missing');
  }

  return Number(id);
}

export function sanitizeUser(user: Model | Record<string, unknown>): Record<string, unknown> {
  const userData =
    typeof (user as Model).toJSON === 'function'
      ? (user as Model).toJSON()
      : { ...(user as Record<string, unknown>) };

  const userId = resolveUserId(user);
  userData.id = userId;
  delete userData.password;
  return userData;
}

export function buildAuthPayload(user: Model | Record<string, unknown>): AuthPayload {
  const userId = resolveUserId(user);
  const userData = sanitizeUser(user);

  const accessToken = AuthTokenService.sign({
    userId,
    email: userData.email as string,
  });

  return { user: userData, accessToken };
}
