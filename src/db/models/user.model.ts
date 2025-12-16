import { DataTypes, UUIDV4 } from 'sequelize'
import { Column, CreatedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript'


import { UserRoles } from '../../RESTful/types/user.types'
import { getDate, getIsoTimestamp, getUserFullName, setDate, toLowerCase } from '../../lib'

@Table({
  modelName: 'User',
  tableName: 'users',
  underscored: true,
})

export class User extends Model {

  @Column({
    allowNull: false,
    defaultValue: UUIDV4,
    primaryKey: true,
    type: DataTypes.UUID,
  })
  public id: string
  
  @Column({
    allowNull: false,
    set: toLowerCase('userNumber'),
    type: DataTypes.STRING(10),
    unique: true,
  })
  
  public userNumber: string

  @Column({
    allowNull: false,
    set: toLowerCase('firstName'),
    type: DataTypes.STRING(32),
  })
  public firstName: string

  @Column({
    allowNull: false,
    set: toLowerCase('lastName'),
    type: DataTypes.STRING(32),
  })
  public lastName: string

  @Column({
    comment: 'User full name',
    get: getUserFullName,
    type: DataTypes.VIRTUAL,
  })
  public fullName: string


  @Column({
    allowNull: false,
    set: toLowerCase('email'),
    type: DataTypes.STRING(32),
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  public email: string


  @Column({
    allowNull: false,
    set: toLowerCase('deviceId'),
    type: DataTypes.STRING(32),
    unique: false,
  })
  public deviceId: string

  @Column({
    allowNull: false,
    type: DataTypes.STRING(),
    unique: false,
  })
  public fcmToken: string

  @Column({
    allowNull: false,
    type: DataTypes.STRING, 
  })
  public password: string;
  

  @Column({
    allowNull: false,
    comment: 'User Roles',
    type: DataTypes.ENUM({ values: Object.values(UserRoles) }),
  })
  public userRole: UserRoles | null


  @CreatedAt
  @Column({
    allowNull: false,
    comment: 'User created DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('createdAt'),
    set: setDate('createdAt'),
    type: DataTypes.DATE,
  })
  public createdAt: Date

  @UpdatedAt
  @Column({
    allowNull: false,
    comment: 'User updated DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('updatedAt'),
    set: setDate('updatedAt'),
    type: DataTypes.DATE,
  })
  public updatedAt: Date
}
