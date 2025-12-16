import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { Company } from './company.model';
import { Lookup } from './lookup.model';
import { User } from './user.model';

import { getDate, getIsoTimestamp, setDate } from '../../lib';

@Table({
  modelName: 'MaintenanceService',
  tableName: 'maintenance_services',
  underscored: true,
})
export class MaintenanceService extends Model {
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  public itemId: number;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('company', 'ticket'),
    defaultValue: 'company',
  })
  public itemType: 'company' | 'ticket';

  @BelongsTo(() => Company, { foreignKey: 'itemId', as: 'company', constraints: false })
  public company?: Company;

  @ForeignKey(() => Lookup)
  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  public mainServiceId: number;

  @BelongsTo(() => Lookup, { foreignKey: 'mainServiceId', as: 'mainService' })
  public mainService: Lookup;

  @ForeignKey(() => Lookup)
  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  public subServiceId: number;

  @BelongsTo(() => Lookup, { foreignKey: 'subServiceId', as: 'subService' })
  public subService: Lookup;

  @Column({
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  })
  public isActive: boolean;

  @CreatedAt
  @Column({
    allowNull: false,
    comment: 'MaintenanceService created DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('createdAt'),
    set: setDate('createdAt'),
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @UpdatedAt
  @Column({
    allowNull: false,
    comment: 'MaintenanceService updated DateTime',
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

