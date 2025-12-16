import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { File } from './file.model';
import { Ticket } from './ticket.model';
import { User } from './user.model';

import { getDate, getIsoTimestamp, setDate } from '../../lib';

export enum AdditionalWorkStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}

@Table({
  modelName: 'AdditionalWork',
  tableName: 'additional_work',
  underscored: true,
})
export class AdditionalWork extends Model {
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @ForeignKey(() => Ticket)
  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  public ticketId: number;

  @BelongsTo(() => Ticket, { foreignKey: 'ticketId', as: 'ticket' })
  public ticket: Ticket;

  @Column({
    allowNull: false,
    type: DataTypes.STRING(255),
  })
  public title: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  public description: string;

  @Column({
    allowNull: false,
    defaultValue: AdditionalWorkStatus.IN_PROGRESS,
    type: DataTypes.ENUM(...Object.values(AdditionalWorkStatus)),
  })
  public status: AdditionalWorkStatus;

  @ForeignKey(() => File)
  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  public proposalFileId: number | null;

  @BelongsTo(() => File, { foreignKey: 'proposalFileId', as: 'proposalFile' })
  public proposalFile: File | null;

  @Column({
    allowNull: false,
    comment: 'Date and time when the work was submitted',
    defaultValue: getIsoTimestamp,
    get: getDate('submittedAt'),
    set: setDate('submittedAt'),
    type: DataTypes.DATE,
  })
  public submittedAt: Date;

  @CreatedAt
  @Column({
    allowNull: false,
    comment: 'AdditionalWork created DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('createdAt'),
    set: setDate('createdAt'),
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @UpdatedAt
  @Column({
    allowNull: false,
    comment: 'AdditionalWork updated DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('updatedAt'),
    set: setDate('updatedAt'),
    type: DataTypes.DATE,
  })
  public updatedAt: Date;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who created this record',
    type: DataTypes.INTEGER,
  })
  public createdBy: number | null;

  @BelongsTo(() => User, { foreignKey: 'createdBy', as: 'creator' })
  public creator?: User | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who last updated this record',
    type: DataTypes.INTEGER,
  })
  public updatedBy: number | null;

  @BelongsTo(() => User, { foreignKey: 'updatedBy', as: 'updater' })
  public updater?: User | null;

  @Column({
    allowNull: true,
    comment: 'DateTime when record was deleted',
    get: getDate('deletedAt'),
    set: setDate('deletedAt'),
    type: DataTypes.DATE,
  })
  public deletedAt: Date | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who deleted this record',
    type: DataTypes.INTEGER,
  })
  public deletedBy: number | null;

  @BelongsTo(() => User, { foreignKey: 'deletedBy', as: 'deleter' })
  public deleter?: User | null;

  @Column({
    allowNull: false,
    comment: 'Whether the record is deleted (soft delete)',
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  })
  public isDeleted: boolean;
}

