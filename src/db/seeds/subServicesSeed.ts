export interface SubServiceData {
  id: string;
  name: string;
  nameArabic: string | null;
  code: string | null;
  description: string | null;
  mainServiceId: string;
  orderId: number;
  isActive: boolean;
}

export const SUB_SERVICES_DATA: readonly SubServiceData[] = [
  {
    code: 'HVAC-INSTALL',
    description: 'HVAC installation services',
    id: 'e1b2c3d4-e5f6-4789-a012-345678901234',
    isActive: true,
    mainServiceId: 'a1b2c3d4-e5f6-4789-a012-345678901234', // HVAC
    name: 'Installation',
    nameArabic: 'التثبيت',
    orderId: 1,
  },
  {
    code: 'HVAC-REPAIR',
    description: 'HVAC repair services',
    id: 'e2c3d4e5-f6a7-4890-b123-456789012345',
    isActive: true,
    mainServiceId: 'a1b2c3d4-e5f6-4789-a012-345678901234', // HVAC
    name: 'Repair',
    nameArabic: 'الإصلاح',
    orderId: 2,
  },
  {
    code: 'HVAC-MAINT',
    description: 'HVAC maintenance services',
    id: 'e3d4e5f6-a7b8-4901-c234-567890123456',
    isActive: true,
    mainServiceId: 'a1b2c3d4-e5f6-4789-a012-345678901234', // HVAC
    name: 'Maintenance',
    nameArabic: 'الصيانة',
    orderId: 3,
  },
  {
    code: 'ELEC-INSTALL',
    description: 'Electrical installation services',
    id: 'e4e5f6a7-b8c9-4012-d345-678901234567',
    isActive: true,
    mainServiceId: 'b2c3d4e5-f6a7-4890-b123-456789012345', // Electrical
    name: 'Installation',
    nameArabic: 'التثبيت',
    orderId: 1,
  },
  {
    code: 'ELEC-REPAIR',
    description: 'Electrical repair services',
    id: 'e5f6a7b8-c9d0-4123-e456-789012345678',
    isActive: true,
    mainServiceId: 'b2c3d4e5-f6a7-4890-b123-456789012345', // Electrical
    name: 'Repair',
    nameArabic: 'الإصلاح',
    orderId: 2,
  },
  {
    code: 'PLUMB-INSTALL',
    description: 'Plumbing installation services',
    id: 'e6a7b8c9-d0e1-4234-f567-890123456789',
    isActive: true,
    mainServiceId: 'c3d4e5f6-a7b8-4901-c234-567890123456', // Plumbing
    name: 'Installation',
    nameArabic: 'التثبيت',
    orderId: 1,
  },
  {
    code: 'PLUMB-REPAIR',
    description: 'Plumbing repair services',
    id: 'e7b8c9d0-e1f2-4345-a678-901234567890',
    isActive: true,
    mainServiceId: 'c3d4e5f6-a7b8-4901-c234-567890123456', // Plumbing
    name: 'Repair',
    nameArabic: 'الإصلاح',
    orderId: 2,
  },
  {
    code: 'ELEV-MAINT',
    description: 'Elevator maintenance services',
    id: 'e8c9d0e1-f2a3-4456-b789-012345678901',
    isActive: true,
    mainServiceId: 'd4e5f6a7-b8c9-4012-d345-678901234567', // Elevator
    name: 'Maintenance',
    nameArabic: 'الصيانة',
    orderId: 1,
  },
];

