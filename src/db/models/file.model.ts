import { DataTypes } from 'sequelize';
import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from './user.model';

import { getDate, getIsoTimestamp, setDate } from '../../lib';

// Legacy enums for backward compatibility
export enum FileCategory {
  IMAGE = 'image',
  CONTRACT = 'contract',
}

export enum FileEntityType {
  COMPANY = 'company',
  CONTRACT = 'contract',
  USER = 'user',
}

// ReferenceType enum values as per specification
export enum FileReferenceType {
  TICKET_ATTACHMENT = 'TICKET_ATTACHMENT',
  COMPANY = 'COMPANY',
  USER = 'USER',
  LOGO = 'LOGO',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  ASSET = 'ASSET',
  PROJECT = 'PROJECT',
  GENERAL = 'GENERAL',
}

// FileType enum values
export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  EXCEL = 'excel',
  XLSX = 'xlsx',
  VIDEO = 'video',
  OTHER = 'other',
}

// StorageProvider enum values
export enum StorageProvider {
  LOCAL = 'LOCAL',
  AWS_S3 = 'AWS_S3',
  AZURE_BLOB = 'AZURE_BLOB',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
}

// Helper functions to convert between old and new formats
export const convertFileCategoryToFileType = (category: FileCategory): string => {
  switch (category) {
    case FileCategory.IMAGE:
      return FileType.IMAGE;
    case FileCategory.CONTRACT:
      return FileType.PDF;
    default:
      return FileType.OTHER;
  }
};

export const convertFileEntityTypeToReferenceType = (entityType: FileEntityType): string => {
  switch (entityType) {
    case FileEntityType.COMPANY:
      return FileReferenceType.COMPANY;
    case FileEntityType.CONTRACT:
      return FileReferenceType.CONTRACT;
    case FileEntityType.USER:
      return FileReferenceType.USER;
    default:
      return FileReferenceType.GENERAL;
  }
};

@Table({
  modelName: 'File',
  tableName: 'files',
  underscored: true,
})
export class File extends Model {
  @Column({
    allowNull: false,
    autoIncrement: true, // Keep as INTEGER until migration is run
    primaryKey: true,
    type: DataTypes.INTEGER, // Temporarily INTEGER until migration is run
  })
  public id: number; // Temporarily number until migration is run

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'ID of the entity this file belongs to (TicketId, CompanyId, UserId, etc.)',
    type: DataTypes.INTEGER, // Using INTEGER to match existing entity IDs
  })
  public referenceId?: number | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'Type of entity this file belongs to (TICKET_ATTACHMENT, COMPANY, USER, LOGO, CONTRACT, etc.)',
    type: DataTypes.STRING(100),
  })
  public referenceType?: string | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'Stored filename on disk',
    type: DataTypes.STRING(255),
    // Don't specify field - let Sequelize use underscored conversion, but we'll use legacy 'filename' field instead
  })
  public fileName?: string | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'File extension (jpg, png, pdf, docx, etc.)',
    type: DataTypes.STRING(20),
    field: 'file_extension', // Explicitly map to file_extension column
  })
  public fileExtension?: string | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'File size in megabytes',
    type: DataTypes.DECIMAL(10, 2),
    field: 'file_size_mb', // Explicitly map to file_size_mb column
  })
  public fileSizeMB?: number | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'File type category (image, pdf, doc, excel, video, etc.)',
    type: DataTypes.STRING(50),
    field: 'file_type', // Explicitly map to file_type column
  })
  public fileType?: string | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'Actual path OR URL in S3/Blob storage',
    type: DataTypes.STRING(500),
    field: 'file_path', // Explicitly map to file_path column
  })
  public filePath?: string | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    defaultValue: StorageProvider.LOCAL,
    comment: 'Storage provider (LOCAL, AWS_S3, AZURE_BLOB, GOOGLE_CLOUD)',
    type: DataTypes.STRING(100),
  })
  public storageProvider?: string | null;

  @Column({
    allowNull: true,
    comment: 'Optional file description',
    type: DataTypes.STRING(2000),
  })
  public description: string | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true, // Temporarily optional until migration is run
    comment: 'User who uploaded this file',
    type: DataTypes.INTEGER,
  })
  public uploadedBy?: number | null;

  @BelongsTo(() => User, { foreignKey: 'uploadedBy', as: 'uploader' })
  public uploader?: User | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    defaultValue: getIsoTimestamp,
    comment: 'File upload timestamp',
    get: getDate('uploadedAt'),
    set: setDate('uploadedAt'),
    type: DataTypes.DATE,
  })
  public uploadedAt?: Date | null;

  @Column({
    allowNull: true, // Temporarily optional until migration is run
    defaultValue: false,
    comment: 'Soft delete flag',
    type: DataTypes.BOOLEAN,
  })
  public isDeleted?: boolean | null;

  @Column({
    allowNull: true,
    comment: 'Soft delete timestamp',
    get: getDate('deletedAt'),
    set: setDate('deletedAt'),
    type: DataTypes.DATE,
  })
  public deletedAt: Date | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who deleted this file',
    type: DataTypes.INTEGER,
  })
  public deletedBy: number | null;

  @BelongsTo(() => User, { foreignKey: 'deletedBy', as: 'deleter' })
  public deleter?: User | null;

  // Legacy fields for backward compatibility (deprecated - use new fields instead)
  // These will be removed in a future migration after all code is updated
  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use referenceId instead',
    type: DataTypes.INTEGER,
  })
  public entityId?: number | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use referenceType instead',
    type: DataTypes.ENUM({ values: Object.values(FileEntityType) }),
  })
  public entityType?: FileEntityType | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use fileName instead',
    type: DataTypes.STRING(255),
  })
  public filename?: string | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Original filename from upload',
    type: DataTypes.STRING(255),
  })
  public originalFilename?: string | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use filePath instead',
    type: DataTypes.STRING(500),
  })
  public path?: string | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: File MIME type',
    type: DataTypes.STRING(100),
  })
  public mimeType?: string | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: File size in bytes (use fileSizeMB instead)',
    type: DataTypes.BIGINT,
  })
  public size?: number | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use fileType instead',
    type: DataTypes.ENUM({ values: Object.values(FileCategory) }),
  })
  public category?: FileCategory | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use uploadedBy and uploadedAt instead',
    type: DataTypes.INTEGER,
  })
  public createdBy?: number | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use uploadedBy and uploadedAt instead',
    type: DataTypes.INTEGER,
  })
  public updatedBy?: number | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED: Use uploadedAt instead',
    get: getDate('createdAt'),
    set: setDate('createdAt'),
    type: DataTypes.DATE,
  })
  public createdAt?: Date | null;

  @Column({
    allowNull: true,
    comment: 'DEPRECATED',
    get: getDate('updatedAt'),
    set: setDate('updatedAt'),
    type: DataTypes.DATE,
  })
  public updatedAt?: Date | null;
}
