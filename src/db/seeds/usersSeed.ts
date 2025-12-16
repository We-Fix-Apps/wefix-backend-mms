
const fcmDoctorToken = 'cV00j5FkTT-5Fdfe-I0BJT:APA91bFyHALCDXlJCfKNDqAlE9iLg5LHDuHZvpAQj-MnPqICA5xELAySa1aTAK9Tu0Wpd0lUdThEi-zbnBMxIVFzowSmaHtyd_c6O6OAOSZqNWJEbmmXQwFKuCRsh09nAfwQKppdkeFV';
const fcmStudentToken = 'dZ3rv3gWSn-4a8Gqrh_IMr:APA91bHnc3MKCyjWGcV20pqci72cu4CwsUk3QjPjVniF4khSTCJKKCeaHde0GRrL3VPHBLbm5b2Rxk31zvbu3nisSA8-dd8-d-qCNsGd50KIHSLUI18hpnxYjnJurBREigfg3KJ88xPU';
const anotherfcmStudentToken = 'eVTW8uBURTmVjkiXfGSOsB:APA91bFZm2iNTX_RpVC5rdjy3r9h8WQzE84TXhekqChngnoRr_WaEpUTgw8TFTL01mecNB-um3rGs78kdnzpUNE_mu8sv-0BhzCydQ1z09LrUFhf2MgjjVZPwZnvwfbP9XjLt5wZoshD';

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  userNumber: string;
  password: string;
  userRoleId: number; // Lookup ID reference
  companyId?: number | null;
  deviceId: string;
  fcmToken: string;
  mobileNumber?: string | null;
  countryCode?: string | null;
  username?: string | null; // 5 characters for company roles
}

// Password: Jadcom@1100 (hashed with bcrypt)
const hashedPassword = '$2b$10$Q4bQvCwOaZZYpLm5aYvWauQx5lfuY.zXzXk3knSiro2VO1iMyHOy6';

export const USER_DATA: readonly UserData[] = [
  // Super User removed - use 'yarn create:superuser' script to create it
  {
    email: 'admin@wefix.com',
    firstName: 'System',
    lastName: 'Administrator',
    userNumber: 'USR002',
    password: hashedPassword,
    userRoleId: 18, // Company Admin
    companyId: 1, // Will be mapped to WeFix company (first in the list)
    deviceId: 'web-admin-device',
    fcmToken: 'admin-fcm-token',
    mobileNumber: '791234567',
    countryCode: '+962',
    username: 'admin',
  },
  {
    email: 'teamlead@wefix.com',
    firstName: 'Ahmad',
    lastName: 'Salem',
    userNumber: 'USR003',
    password: hashedPassword,
    userRoleId: 20, // Team Leader
    companyId: 1,
    deviceId: 'mobile-teamlead',
    fcmToken: fcmDoctorToken,
    mobileNumber: '791234569',
    countryCode: '+962',
    username: 'TL001',
  },
  {
    email: 'technician@wefix.com',
    firstName: 'Mohammed',
    lastName: 'Hassan',
    userNumber: 'USR004',
    password: hashedPassword,
    userRoleId: 21, // Technician
    companyId: 1,
    deviceId: 'mobile-technician',
    fcmToken: anotherfcmStudentToken,
    mobileNumber: '791234571',
    countryCode: '+962',
    username: 'TCH01',
  },
  {
    email: 'subtechnician@wefix.com',
    firstName: 'Fatima',
    lastName: 'Ali',
    userNumber: 'USR005',
    password: hashedPassword,
    userRoleId: 22, // Sub-Technician
    companyId: 1,
    deviceId: 'web-subtechnician',
    fcmToken: 'subtechnician-fcm-token',
    mobileNumber: '791234574',
    countryCode: '+962',
    username: 'SUB01',
  },
  {
    email: 'individual@wefix.com',
    firstName: 'Youssef',
    lastName: 'Mahmoud',
    userNumber: 'USR006',
    password: hashedPassword,
    userRoleId: 23, // Individual
    companyId: null,
    deviceId: 'mobile-individual',
    fcmToken: 'individual-fcm-token',
    mobileNumber: '791234575',
    countryCode: '+962',
    username: null,
  },
  {
    email: 'admin@gamma.com',
    firstName: 'Gamma',
    lastName: 'Administrator',
    userNumber: 'USR007',
    password: hashedPassword,
    userRoleId: 18, // Company Admin
    companyId: 2, // Gamma Solutions (second company in the list)
    deviceId: 'web-gamma-admin',
    fcmToken: 'gamma-admin-fcm-token',
    mobileNumber: '9999',
    countryCode: '+962',
    username: 'gammaadmin',
  },
];

