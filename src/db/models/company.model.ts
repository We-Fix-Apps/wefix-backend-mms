import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { Lookup } from './lookup.model';
import { User } from './user.model';

import { CompanyStatus } from '../../graphql/service/Company/typedefs/Company/enums/Company.enums';
import { getDate, getIsoTimestamp, setDate, toLowerCase } from '../../lib';

@Table({
  modelName: 'Company',
  tableName: 'companies',
  underscored: true,
})
export class Company extends Model {
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING(20),
    unique: true,
  })
  public companyId: string;

  @Column({
    allowNull: false,
    set: toLowerCase('title'),
    type: DataTypes.STRING(100),
  })
  public title: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING(100),
  })
  public companyNameArabic: string | null;

  @Column({
    allowNull: true,
    type: DataTypes.STRING(100),
  })
  public companyNameEnglish: string | null;

  @ForeignKey(() => Lookup)
  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  public countryLookupId: number | null;

  @BelongsTo(() => Lookup, { foreignKey: 'countryLookupId', as: 'countryLookup' })
  public countryLookup: Lookup;

  @ForeignKey(() => Lookup)
  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  public stateLookupId: number | null;

  @BelongsTo(() => Lookup, { foreignKey: 'stateLookupId', as: 'stateLookup' })
  public stateLookup: Lookup;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  public hoAddress: string | null;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  public hoLocation: string | null;

  @Column({
    allowNull: true,
    type: DataTypes.STRING(10),
    unique: true,
  })
  public ticketShortCode: string | null;

  @Column({
    allowNull: false,
    defaultValue: CompanyStatus.ACTIVE,
    type: DataTypes.ENUM({ values: Object.values(CompanyStatus) }),
  })
  public isActive: CompanyStatus;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  public logo: string | null;

  @CreatedAt
  @Column({
    allowNull: false,
    comment: 'Company created DateTime',
    defaultValue: getIsoTimestamp,
    get: getDate('createdAt'),
    set: setDate('createdAt'),
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @UpdatedAt
  @Column({
    allowNull: false,
    comment: 'Company updated DateTime',
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

  @Column({
    allowNull: true,
    comment: 'Total limit for corrective tickets',
    defaultValue: 0,
    type: DataTypes.INTEGER,
  })
  public totalCorrective: number;

  @Column({
    allowNull: true,
    comment: 'Total limit for preventive tickets',
    defaultValue: 0,
    type: DataTypes.INTEGER,
  })
  public totalPreventive: number;

  @Column({
    allowNull: true,
    comment: 'Total limit for emergency tickets',
    defaultValue: 0,
    type: DataTypes.INTEGER,
  })
  public totalEmergency: number;
}

