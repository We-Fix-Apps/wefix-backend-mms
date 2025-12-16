import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FindOptions } from 'sequelize/types';
import { User } from '../../../db/models/user.model';
import { CreateUserInput, UpdateUserInput, UserOrm, UserRoles } from '../../types/user.types';

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
  public getStudentsInCourseActivity: (courseId: string, activityId: string) => Promise<UserOrm[]>;
  public getStudentInCourseActivity: (activityId: string, studentId: string) => Promise<UserOrm>;
  public getStudentsDeviceTokensForCourse: (courseId: string) => Promise<UserOrm[]>;

  constructor() {
    this.authenticateUser = this._authenticateUser.bind(this);
    this.createUser = this._createUser.bind(this);
    this.deleteUserById = this._deleteUserById.bind(this);
    this.getUserById = this._getUserById.bind(this);
    this.getUserByToken = this._getUserByToken.bind(this);
    this.getUsers = this._getUsers.bind(this);
    this.getStudents = this._getStudents.bind(this);
    this.updateUserById = this._updateUserById.bind(this);
    this.validateRefreshToken = this._validateRefreshToken.bind(this);
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

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Update the user's FCM token and device ID
      await user.update({ fcmToken, deviceId });

      return user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  public async _validateRefreshToken(userEmail: string): Promise<User | null> {
    try {
      const user = await User.findOne({ where: { email: userEmail } });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new Error(`Error validating refresh token: ${error.message}`);
    }
  }

  private async _getUsers(where: FindOptions): Promise<UserOrm[]> {
    try {
      const users = await User.findAll(where);
      return users;
    } catch (error) {
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  private async _getStudents(): Promise<User[]> {
    try {
      const students = await User.findAll({
        where: {
          userRole: UserRoles.STUDENT,
        },
      });
      return students;
    } catch (error) {
      throw new Error(`Error fetching students: ${error.message}`);
    }
  }

  private async _getUserByToken(token: string): Promise<UserOrm | null> {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      const userEmail = decoded['email'];

      const user = await User.findOne({ where: { email: userEmail } });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Unable to authenticate user');
    }
  }

  private async _getUserById(id: string): Promise<UserOrm | null> {
    try {
      const user = await User.findOne({ where: { id } });
      return user;
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
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      if (!deviceId) {
        return null;
      }

      if (!fcmToken) {
        return null;
      }

      const userCreationData = {
        email: userData.email.toLocaleLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        userNumber: userData.userNumber,
        password: hashedPassword,
        userRole: userData.userRole,
        fcmToken: userData.fcmToken,
        deviceId: userData.deviceId,
      };

      const newUser = await User.create(userCreationData);
      return newUser;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  private async _updateUserById(id: string, updateData: Partial<UserOrm>): Promise<UserOrm | null> {
    try {
      const user = await User.findOne({ where: { id } });
      if (user) {
        if (updateData.password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        await user.update(updateData);
        return user;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to update user with ID ${id}: ${error.message}`);
    }
  }

  private async _deleteUserById(id: string): Promise<boolean> {
    try {
      const deleted = await User.destroy({ where: { id } });
      return deleted > 0;
    } catch (error) {
      throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
    }
  }
}

export default UserRepository;


