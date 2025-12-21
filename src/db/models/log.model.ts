import { DataTypes } from 'sequelize'
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript'


import { Actions } from './enums'
import { User } from './user.model'

import { getDate, getIsoTimestamp, setDate } from '../../lib'

@Table({
  modelName: 'Log',
  tableName: 'logs',
})
export class Log extends Model {
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number

  @Column({
    allowNull: false,
    comment: 'Action type for logs: in, out, break, leave',
    type: DataTypes.ENUM(...Object.values(Actions)),
  })
  public action_type: Actions

  @Column({
    allowNull: false,
    comment: 'Time of logged action',
    defaultValue: getIsoTimestamp,
    type: DataTypes.DATE,
  })
  public time: Date

  @Column({
    allowNull: true,
    comment: 'Description for logging action',
    type: DataTypes.STRING(100),
  })
  public description: string

  @ForeignKey(() => User)
  @Column({ type: DataTypes.INTEGER })
  public user_id: number

  @BelongsTo(() => User)
  public user: User

  @CreatedAt
  @Column({
    allowNull: false,
    comment: 'Log created DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('created_at'),
    set: setDate('created_at'),
    type: DataTypes.DATE,
  })
  public created_at: Date

  @UpdatedAt
  @Column({
    allowNull: false,
    comment: 'Log updated DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('updated_at'),
    set: setDate('updated_at'),
    type: DataTypes.DATE,
  })
  public updated_at: Date

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  })
  public is_archived: boolean

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who created this record',
    type: DataTypes.INTEGER,
  })
  public created_by: number | null

  @BelongsTo(() => User, { foreignKey: 'created_by', as: 'creator' })
  public creator?: User | null

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who last updated this record',
    type: DataTypes.INTEGER,
  })
  public updated_by: number | null

  @BelongsTo(() => User, { foreignKey: 'updated_by', as: 'updater' })
  public updater?: User | null

  @Column({
    allowNull: true,
    comment: 'DateTime when record was deleted',
    get: getDate('deleted_at'),
    set: setDate('deleted_at'),
    type: DataTypes.DATE,
  })
  public deleted_at: Date | null

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who deleted this record',
    type: DataTypes.INTEGER,
  })
  public deleted_by: number | null

  @BelongsTo(() => User, { foreignKey: 'deleted_by', as: 'deleter' })
  public deleter?: User | null

  @Column({
    allowNull: false,
    comment: 'Whether the record is active',
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  })
  public is_active: boolean

  @Column({
    allowNull: false,
    comment: 'Whether the record is deleted (soft delete)',
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  })
  public is_deleted: boolean
}
