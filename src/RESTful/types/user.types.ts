import { Model } from 'sequelize-typescript';

export enum UserRoles {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
  DOCTOR = 'Doctor',
}

export interface UserOrm extends Model {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userNumber: string;
  password: string;
  userRole: UserRoles;
  fcmToken: string;
  deviceId: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userNumber?: string;
  userRole?: UserRoles;
  fcmToken?: string;
  deviceId?: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userNumber?: string;
  userRole?: UserRoles;
  fcmToken?: string;
  deviceId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  deviceId: string;
  fcmToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}


