import { DataTypes, UUIDV4 } from 'sequelize'
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript'


import { User } from './user.model'

import { Actions } from '../../RESTful/types/log.types'
import { getDate, getIsoTimestamp, setDate } from '../../lib'

@Table({
  modelName: 'Log',
  tableName: 'logs',
})
export class Log extends Model {
  @Column({
    allowNull: false,
    defaultValue: UUIDV4,
    primaryKey: true,
    type: DataTypes.UUID,
  })
  public id: string

  @Column({
    allowNull: false,
    comment: 'Action type for logs: in, out, break, leave',
    type: DataTypes.ENUM({ values: Object.values(Actions) }),
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
  @Column({ type: DataTypes.STRING })
  public user_id: string

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
}
