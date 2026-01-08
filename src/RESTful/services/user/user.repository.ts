import * as bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { FindOptions } from 'sequelize/types';

import { User } from '../../../db/models/user.model';
import { CreateUserInput, UpdateUserInput, UserOrm } from '../../types/user.types';

interface DecodedToken extends JwtPayload {
  email: string;
}

class UserRepository {
  public authenticateUser: (email: string, password: string, deviceId: string, fcmToken: string) => Promise<UserOrm | null>;
  public createUser: (userData: CreateUserInput, deviceId: string, fcmToken: string) => Promise<UserOrm>;
  public deleteUserById: (id: string) => Promise<boolean>;
  public getUserById: (id: string) => Promise<UserOrm | null>;
  public getUserByToken: (token: string) => Promise<UserOrm | null>;
  public getUsers: (where: FindOptions) => Promise<UserOrm[]>;
  public getStudents: (where: FindOptions) => Promise<UserOrm[]>;
  public updateUserById: (id: string, updateData: UpdateUserInput) => Promise<UserOrm | null>;
  public validateRefreshToken: (email: string) => Promise<UserOrm | null>;
  public updateUserToken: (id: string, token: string, tokenExpiresAt: Date) => Promise<void>;
  public clearUserToken: (id: string) => Promise<void>;
  public getStudentsInCourseActivity: (courseId: string, activityId: string) => Promise<UserOrm[]>;
  public getStudentInCourseActivity: (activityId: string, studentId: string) => Promise<UserOrm>;
  public getStudentsDeviceTokensForCourse: (courseId: string) => Promise<UserOrm[]>;
  public getUserByPhone: (phoneNumber: string) => Promise<UserOrm | null>;

  constructor() {
    this.authenticateUser = this._authenticateUser.bind(this);
    this.createUser = this._createUser.bind(this);
    this.deleteUserById = this._deleteUserById.bind(this);
    this.getUserById = this._getUserById.bind(this);
    this.getUserByToken = this._getUserByToken.bind(this);
    this.getUsers = this._getUsers.bind(this);
    this.updateUserById = this._updateUserById.bind(this);
    this.validateRefreshToken = this._validateRefreshToken.bind(this);
    this.updateUserToken = this._updateUserToken.bind(this);
    this.clearUserToken = this._clearUserToken.bind(this);
    this.getUserByPhone = this._getUserByPhone.bind(this);
  }

  private async _authenticateUser(
    userEmail: string,
    password: string,
    deviceId: string,
    fcmToken: string
  ): Promise<UserOrm | null> {
    try {
      const email = userEmail.toLocaleLowerCase();
      const user = await User.findOne({ where: { email } });

      if (!user || !deviceId || !fcmToken) {
        return null;
      }

      // Check if user is active
      if (!user.isActive) {
        const inactiveError: any = new Error('ACCOUNT_INACTIVE');
        inactiveError.isInactive = true;
        inactiveError.message = 'Your account is inactive. Please contact your administrator to activate your account.\nحسابك غير نشط. يرجى التواصل مع المسؤول لتفعيل حسابك.';
        throw inactiveError;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Update the user's FCM token and device ID
      await user.update({ fcmToken, deviceId });

      return user as UserOrm;
    } catch (error: any) {
      // If it's an inactive account error, re-throw it as is
      if (error.isInactive) {
        throw error;
      }
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  public async _validateRefreshToken(userEmail: string): Promise<UserOrm | null> {
    try {
      const user = await User.findOne({ where: { email: userEmail } });

      if (!user) {
        return null;
      }

      return user as UserOrm;
    } catch (error) {
      throw new Error(`Error validating refresh token: ${error.message}`);
    }
  }

  private async _getUsers(where: FindOptions): Promise<UserOrm[]> {
    try {
      const users = await User.findAll(where);
      return users as UserOrm[];
    } catch (error) {
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }


  private async _getUserByToken(token: string): Promise<UserOrm | null> {
    try {
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        throw new Error('JWT_SECRET must be set in environment variables');
      }
      const decoded = jwt.verify(token, secretKey) as DecodedToken;

      const userEmail = decoded.email;

      const user = await User.findOne({ where: { email: userEmail } });

      if (!user) {
        throw new Error('User not found');
      }

      return user as UserOrm;
    } catch (error) {
      throw new Error('Unable to authenticate user');
    }
  }

  private async _getUserById(id: string): Promise<UserOrm | null> {
    try {
      const user = await User.findOne({ where: { id: parseInt(id) } });
      return user as UserOrm | null;
    } catch (error) {
      throw new Error('Unable to authenticate user');
    }
  }

  private async _createUser(
    userData: CreateUserInput,
    deviceId: string,
    fcmToken: string
  ): Promise<UserOrm> {
    try {
      if (!deviceId || !fcmToken) {
        throw new Error('Device ID and FCM token are required');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const userCreationData: any = {
        email: userData.email.toLocaleLowerCase(),
        fullName: userData.fullName,
        fullNameEnglish: userData.fullNameEnglish,
        userNumber: userData.userNumber || `USR${Date.now()}`,
        password: hashedPassword,
        userRoleId: userData.userRoleId || 1,
        fcmToken,
        deviceId,
      };

      if (userData.mobileNumber) {
        userCreationData.mobileNumber = userData.mobileNumber;
      }
      if (userData.countryCode) {
        userCreationData.countryCode = userData.countryCode;
      }
      if (userData.username) {
        userCreationData.username = userData.username;
      }
      if (userData.companyId) {
        userCreationData.companyId = userData.companyId;
      }
      if (userData.profileImage) {
        userCreationData.profileImage = userData.profileImage;
      }
      if (userData.gender) {
        userCreationData.gender = userData.gender;
      }

      const newUser = await User.create(userCreationData);
      return newUser as UserOrm;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  private async _updateUserById(id: string, updateData: UpdateUserInput): Promise<UserOrm | null> {
    try {
      const user = await User.findOne({ where: { id: parseInt(id) } });
      if (user) {
        const updatePayload: any = { ...updateData };
        if (updateData.password) {
          const salt = await bcrypt.genSalt(10);
          updatePayload.password = await bcrypt.hash(updateData.password, salt);
        }
        if (updateData.email) {
          updatePayload.email = updateData.email.toLowerCase();
        }

        await user.update(updatePayload);
        return user as UserOrm;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to update user with ID ${id}: ${error.message}`);
    }
  }

  private async _deleteUserById(id: string): Promise<boolean> {
    try {
      const deleted = await User.destroy({ where: { id: parseInt(id) } });
      return deleted > 0;
    } catch (error) {
      throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
    }
  }

  private async _updateUserToken(id: string, token: string, tokenExpiresAt: Date): Promise<void> {
    try {
      const user = await User.findOne({ where: { id: parseInt(id) } });
      if (user) {
        await user.update({ token, tokenExpiresAt });
      }
    } catch (error) {
      throw new Error(`Failed to update user token with ID ${id}: ${error.message}`);
    }
  }

  private async _clearUserToken(id: string): Promise<void> {
    try {
      const user = await User.findOne({ where: { id: parseInt(id) } });
      if (user) {
        await user.update({ token: null, tokenExpiresAt: null });
      }
    } catch (error) {
      throw new Error(`Failed to clear user token with ID ${id}: ${error.message}`);
    }
  }

  private async _getUserByPhone(phoneNumber: string): Promise<UserOrm | null> {
    try {
      // Normalize phone number: remove spaces, dashes, parentheses
      let normalizedPhone = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');
      
      // Extract country code and mobile number
      let countryCode: string | null = null;
      let mobileNumber: string = normalizedPhone;
      
      // If phone starts with +, extract country code
      if (normalizedPhone.startsWith('+')) {
        // Try to extract country code (common codes: +1, +20, +44, +962, etc.)
        // For Jordan (+962), mobile number starts after +962
        if (normalizedPhone.startsWith('+962')) {
          countryCode = '+962';
          mobileNumber = normalizedPhone.substring(4); // Remove +962
        } else if (normalizedPhone.startsWith('+1')) {
          countryCode = '+1';
          mobileNumber = normalizedPhone.substring(2);
        } else if (normalizedPhone.startsWith('+20')) {
          countryCode = '+20';
          mobileNumber = normalizedPhone.substring(3);
        } else if (normalizedPhone.startsWith('+44')) {
          countryCode = '+44';
          mobileNumber = normalizedPhone.substring(3);
        } else {
          // For other country codes, try to extract (assume 1-3 digits after +)
          const match = normalizedPhone.match(/^\+(\d{1,3})(.+)$/);
          if (match) {
            countryCode = `+${match[1]}`;
            mobileNumber = match[2];
          }
        }
      } else if (normalizedPhone.startsWith('00')) {
        // Handle 00 prefix (international format without +)
        if (normalizedPhone.startsWith('00962')) {
          countryCode = '+962';
          mobileNumber = normalizedPhone.substring(5);
        } else {
          // Try to extract country code (assume 1-3 digits after 00)
          const match = normalizedPhone.match(/^00(\d{1,3})(.+)$/);
          if (match) {
            countryCode = `+${match[1]}`;
            mobileNumber = match[2];
          }
        }
      }
      
      // First try: match both countryCode and mobileNumber
      let user: any = null;
      if (countryCode) {
        user = await User.findOne({
          where: {
            mobileNumber: mobileNumber,
            countryCode: countryCode,
          },
        });
      }
      
      // Second try: match just mobileNumber (in case countryCode is null or different)
      if (!user) {
        user = await User.findOne({
          where: {
            mobileNumber: mobileNumber,
          },
        });
      }
      
      // Third try: match with full number without + (for backward compatibility)
      if (!user && normalizedPhone.startsWith('+')) {
        user = await User.findOne({
          where: {
            mobileNumber: normalizedPhone.substring(1),
          },
        });
      }
      
      // Fourth try: match with full normalized number as-is
      if (!user) {
        user = await User.findOne({
          where: {
            mobileNumber: normalizedPhone,
          },
        });
      }
      
      return user as UserOrm | null;
    } catch (error) {
      throw new Error(`Failed to find user by phone number: ${error.message}`);
    }
  }
}

export default UserRepository;


