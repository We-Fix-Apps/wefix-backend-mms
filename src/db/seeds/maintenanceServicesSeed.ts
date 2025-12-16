export interface MaintenanceServiceData {
  itemId: number;
  itemType: 'company' | 'ticket';
  mainServiceId: number; // Lookup ID for main service
  subServiceId: number; // Lookup ID for sub service
  isActive: boolean;
}

export const MAINTENANCE_SERVICES_DATA: readonly MaintenanceServiceData[] = [
  // Company 1 maintenance services
  {
    itemId: 1, // Company ID (will be mapped to actual ID)
    itemType: 'company',
    mainServiceId: 86, // Electrical Service
    subServiceId: 92, // Electrical Installation
    isActive: true,
  },
  {
    itemId: 1,
    itemType: 'company',
    mainServiceId: 86, // Electrical Service
    subServiceId: 93, // Electrical Repair
    isActive: true,
  },
  {
    itemId: 1,
    itemType: 'company',
    mainServiceId: 87, // Plumbing Service
    subServiceId: 95, // Plumbing Installation
    isActive: true,
  },
  {
    itemId: 1,
    itemType: 'company',
    mainServiceId: 87, // Plumbing Service
    subServiceId: 96, // Plumbing Repair
    isActive: true,
  },
  {
    itemId: 1,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 98, // HVAC Installation
    isActive: true,
  },
  {
    itemId: 1,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 100, // HVAC Maintenance
    isActive: true,
  },

  // Company 2 maintenance services
  {
    itemId: 2,
    itemType: 'company',
    mainServiceId: 86, // Electrical Service
    subServiceId: 92, // Electrical Installation
    isActive: true,
  },
  {
    itemId: 2,
    itemType: 'company',
    mainServiceId: 86, // Electrical Service
    subServiceId: 93, // Electrical Repair
    isActive: true,
  },
  {
    itemId: 2,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 98, // HVAC Installation
    isActive: true,
  },
  {
    itemId: 2,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 100, // HVAC Maintenance
    isActive: true,
  },

  // Company 3 maintenance services
  {
    itemId: 3,
    itemType: 'company',
    mainServiceId: 87, // Plumbing Service
    subServiceId: 95, // Plumbing Installation
    isActive: true,
  },
  {
    itemId: 3,
    itemType: 'company',
    mainServiceId: 87, // Plumbing Service
    subServiceId: 96, // Plumbing Repair
    isActive: true,
  },
  {
    itemId: 3,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 100, // HVAC Maintenance
    isActive: true,
  },

  // Company 4 maintenance services
  {
    itemId: 4,
    itemType: 'company',
    mainServiceId: 86, // Electrical Service
    subServiceId: 92, // Electrical Installation
    isActive: true,
  },
  {
    itemId: 4,
    itemType: 'company',
    mainServiceId: 86, // Electrical Service
    subServiceId: 93, // Electrical Repair
    isActive: true,
  },
  {
    itemId: 4,
    itemType: 'company',
    mainServiceId: 87, // Plumbing Service
    subServiceId: 95, // Plumbing Installation
    isActive: true,
  },
  {
    itemId: 4,
    itemType: 'company',
    mainServiceId: 87, // Plumbing Service
    subServiceId: 96, // Plumbing Repair
    isActive: true,
  },
  {
    itemId: 4,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 98, // HVAC Installation
    isActive: true,
  },
  {
    itemId: 4,
    itemType: 'company',
    mainServiceId: 88, // HVAC Service
    subServiceId: 100, // HVAC Maintenance
    isActive: true,
  },
];

