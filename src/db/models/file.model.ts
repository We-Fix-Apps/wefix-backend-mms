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
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  public id: string;

  @Column({
    allowNull: true,
    comment: 'ID of the entity this file belongs to (TicketId, CompanyId, UserId, etc.)',
    type: DataTypes.INTEGER,
    field: 'reference_id', // Explicitly map to reference_id column
  })
  public referenceId?: number | null;

  @Column({
    allowNull: true,
    comment: 'Type of entity this file belongs to (TICKET_ATTACHMENT, COMPANY, USER, LOGO, CONTRACT, etc.)',
    type: DataTypes.STRING(100),
    field: 'reference_type', // Explicitly map to reference_type column
  })
  public referenceType?: string | null;

  // Note: There is NO 'file_name' column in the database, only 'filename' (legacy)
  // Use 'filename' property for the legacy column instead

  @Column({
    allowNull: true,
    comment: 'File extension (jpg, png, pdf, docx, etc.)',
    type: DataTypes.STRING(20),
    field: 'file_extension', // Explicitly map to file_extension column
  })
  public fileExtension?: string | null;

  @Column({
    allowNull: true,
    comment: 'File size in megabytes',
    type: DataTypes.DECIMAL(10, 2),
    field: 'file_size_mb', // Explicitly map to file_size_mb column
  })
  public fileSizeMB?: number | null;

  @Column({
    allowNull: true,
    comment: 'File type category (image, pdf, doc, excel, video, etc.)',
    type: DataTypes.STRING(50),
    field: 'file_type', // Explicitly map to file_type column
  })
  public fileType?: string | null;

  @Column({
    allowNull: true,
    comment: 'Actual path OR URL in S3/Blob storage',
    type: DataTypes.STRING(500),
    field: 'file_path', // Explicitly map to file_path column
  })
  public filePath?: string | null;

  @Column({
    allowNull: true,
    defaultValue: StorageProvider.LOCAL,
    comment: 'Storage provider (LOCAL, AWS_S3, AZURE_BLOB, GOOGLE_CLOUD)',
    type: DataTypes.STRING(100),
    field: 'storage_provider', // Explicitly map to storage_provider column
  })
  public storageProvider?: string | null;

  @Column({
    allowNull: true,
    comment: 'Optional file description',
    type: DataTypes.STRING(2000),
    field: 'description', // Explicitly map to description column
  })
  public description: string | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who uploaded this file',
    type: DataTypes.INTEGER,
    field: 'uploaded_by', // Explicitly map to uploaded_by column
  })
  public uploadedBy?: number | null;

  @BelongsTo(() => User, { foreignKey: 'uploadedBy', as: 'uploader' })
  public uploader?: User | null;

  @Column({
    allowNull: true,
    defaultValue: getIsoTimestamp,
    comment: 'File upload timestamp',
    get: getDate('uploadedAt'),
    set: setDate('uploadedAt'),
    type: DataTypes.DATE,
    field: 'uploaded_at', // Explicitly map to uploaded_at column
  })
  public uploadedAt?: Date | null;

  @Column({
    allowNull: true,
    defaultValue: false,
    comment: 'Soft delete flag',
    type: DataTypes.BOOLEAN,
    field: 'is_deleted', // Explicitly map to is_deleted column
  })
  public isDeleted?: boolean | null;

  @Column({
    allowNull: true,
    comment: 'Soft delete timestamp',
    get: getDate('deletedAt'),
    set: setDate('deletedAt'),
    type: DataTypes.DATE,
    field: 'deleted_at', // Explicitly map to deleted_at column
  })
  public deletedAt: Date | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    comment: 'User who deleted this file',
    type: DataTypes.INTEGER,
    field: 'deleted_by', // Explicitly map to deleted_by column
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
