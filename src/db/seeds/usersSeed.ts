import { UserRoles } from '../../RESTful/types/user.types';


const USER_ID_JAD = 'd0b3042a-e75d-43af-97e5-b6455a11bee8';
const USER_ID_JEHAD = '24967689-821c-4003-afb4-564fc89171c8';
const USER_ID_EMAD = '0913932f-0b7b-4dfd-a116-2d054db17bbb';

const fcmDoctorToken = 'cV00j5FkTT-5Fdfe-I0BJT:APA91bFyHALCDXlJCfKNDqAlE9iLg5LHDuHZvpAQj-MnPqICA5xELAySa1aTAK9Tu0Wpd0lUdThEi-zbnBMxIVFzowSmaHtyd_c6O6OAOSZqNWJEbmmXQwFKuCRsh09nAfwQKppdkeFV'
const fcmStudentToken = 'dZ3rv3gWSn-4a8Gqrh_IMr:APA91bHnc3MKCyjWGcV20pqci72cu4CwsUk3QjPjVniF4khSTCJKKCeaHde0GRrL3VPHBLbm5b2Rxk31zvbu3nisSA8-dd8-d-qCNsGd50KIHSLUI18hpnxYjnJurBREigfg3KJ88xPU'
const anotherfcmStudentToken = 'eVTW8uBURTmVjkiXfGSOsB:APA91bFZm2iNTX_RpVC5rdjy3r9h8WQzE84TXhekqChngnoRr_WaEpUTgw8TFTL01mecNB-um3rGs78kdnzpUNE_mu8sv-0BhzCydQ1z09LrUFhf2MgjjVZPwZnvwfbP9XjLt5wZoshD';
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userNumber: string;
  password: string;
  userRole: UserRoles;
  deviceId: string;
  fcmToken: string;
}

export const USER_DATA: readonly UserData[] = [
  {
    id: USER_ID_JAD,
    email: 'jadabuawwad@outlook.com',
    firstName: 'Jad',
    lastName: 'Abu Awwad',
    userNumber: '9971035541',
    password: '$2a$12$Fk4mbwkI3.yAPqWmo8atZuKxl0KhEhPNXdANvHkDifPz5M/PBqqBi',
    userRole: UserRoles.STUDENT,
    deviceId: 'UP1A.231105.015',
    fcmToken: fcmStudentToken
  },
  {
    id: USER_ID_JEHAD,
    email: 'jehadabuawwad@outlook.com',
    firstName: 'Jehad',
    lastName: 'Abu Awwad',
    userNumber: '9971035542',
    password: '$2a$12$Fk4mbwkI3.yAPqWmo8atZuKxl0KhEhPNXdANvHkDifPz5M/PBqqBi',
    userRole: UserRoles.DOCTOR,
    deviceId: 'UP1A.231105.004',
    fcmToken: fcmDoctorToken
  },
  {
    id: USER_ID_EMAD,
    email: 'emadabuawwad@outlook.com',
    firstName: 'Emad',
    lastName: 'Abu Awwad',
    userNumber: '9971035543',
    password: '$2a$12$Fk4mbwkI3.yAPqWmo8atZuKxl0KhEhPNXdANvHkDifPz5M/PBqqBi',
    userRole: UserRoles.STUDENT,
    deviceId: 'UP1A.231105.007',
    fcmToken: anotherfcmStudentToken
  },
];


