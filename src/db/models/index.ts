import { AdditionalWork } from './additional-work.model'
import { Branch } from './branch.model'
import { Company } from './company.model'
import { Contract } from './contract.model'
import { File } from './file.model'
import { Log } from './log.model'
import { Lookup } from './lookup.model'
import { MaintenanceService } from './maintenance-service.model'
import { Ticket } from './ticket.model'
import { User } from './user.model'
import { Zone } from './zone.model'

export * from './additional-work.model'
export * from './branch.model'
export * from './company.model'
export * from './contract.model'
export * from './file.model'
export * from './log.model'
export * from './lookup.model'
export * from './maintenance-service.model'
export * from './ticket.model'
export * from './user.model'
export * from './zone.model'



// Order matters for synchronize: true - tables without foreign keys must come first
// Lookup must come before User, Company, Contract, Branch, etc. since they reference it
export const MODELS = [Log, Lookup, Company, User, Contract, Branch, Zone, MaintenanceService, Ticket, File, AdditionalWork];

export const setupAssociations = () => {
  // Note: Most belongsTo associations are already defined in model decorators (@BelongsTo)
  // Only hasMany associations and File associations need to be set up here
  
  // Contract associations (hasMany only - belongsTo is in decorators)
  Company.hasMany(Contract, { as: 'contracts', foreignKey: 'companyId' });
  
  // Branch associations (hasMany only - belongsTo is in decorators)
  Company.hasMany(Branch, { as: 'branches', foreignKey: 'companyId' });
  
  // Zone associations (hasMany only - belongsTo is in decorators)
  Branch.hasMany(Zone, { as: 'zones', foreignKey: 'branchId' });
  
  // MaintenanceService associations (hasMany only - belongsTo is in decorators)
  // Note: MaintenanceService uses itemId with itemType='company' for polymorphic relationship
  Company.hasMany(MaintenanceService, { 
    as: 'maintenanceServices',
    constraints: false,
    foreignKey: 'itemId', 
    scope: { itemType: 'company' },
  });
  
  // AdditionalWork associations (hasMany only - belongsTo is in decorators)
  Ticket.hasMany(AdditionalWork, { as: 'additionalWorks', foreignKey: 'ticketId' });
  
  // User associations (hasMany only - belongsTo is in decorators)
  Company.hasMany(User, { as: 'users', foreignKey: 'companyId' });
  
  // Ticket associations (hasMany only - belongsTo is in decorators)
  Company.hasMany(Ticket, { as: 'tickets', foreignKey: 'companyId' });
  Contract.hasMany(Ticket, { as: 'tickets', foreignKey: 'contractId' });
  Branch.hasMany(Ticket, { as: 'tickets', foreignKey: 'branchId' });
  Zone.hasMany(Ticket, { as: 'tickets', foreignKey: 'zoneId' });
  
  
  // File associations (polymorphic) - these are new and not in decorators
  // Company files (logo)
  Company.hasMany(File, {
    as: 'files',
    constraints: false,
    foreignKey: 'entityId',
    scope: { entity_type: 'company' },
  });
  File.belongsTo(Company, {
    as: 'company',
    constraints: false,
    foreignKey: 'entityId',
  });
  
  // Contract files (multiple files)
  Contract.hasMany(File, {
    as: 'files',
    constraints: false,
    foreignKey: 'entityId',
    scope: { entity_type: 'contract' },
  });
  File.belongsTo(Contract, {
    as: 'contract',
    constraints: false,
    foreignKey: 'entityId',
  });
  
  // User files (profile image)
  User.hasMany(File, {
    as: 'files',
    constraints: false,
    foreignKey: 'entityId',
    scope: { entity_type: 'user' },
  });
  File.belongsTo(User, {
    as: 'user',
    constraints: false,
    foreignKey: 'entityId',
  });
}