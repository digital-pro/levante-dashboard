const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  projectId: 'cobw62',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://localhost:5173/',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    retries: 2,
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  env: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://localhost:5173',
    firestoreUrl: 'https://firestore.googleapis.com/**/*',
    timeout: 10000,
    sessionCookieName: process.env.SESSION_COOKIE_NAME,
    sessionCookieValue: process.env.SESSION_COOKIE_VALUE,
    superAdminUsername: process.env.SUPER_ADMIN_USERNAME,
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
    superAdminId: process.env.SUPER_ADMIN_ID,
    partnerAdminUsername: process.env.PARTNER_ADMIN_USERNAME,
    partnerAdminPassword: process.env.PARTNER_ADMIN_PASSWORD,
    partnerAdminId: process.env.PARTNER_ADMIN_ID,
    participantUsername: process.env.PARTICIPANT_USERNAME,
    participantPassword: process.env.PARTICIPANT_PASSWORD,
    participantEmail: process.env.PARTICIPANT_EMAIL,
    participantEmailPassword: process.env.PARTICIPANT_EMAIL_PASSWORD,
    testAdministrationName: 'zzzTestAdministration',
    testAdministrationId: 'pdOfQuakqN4re3cI5mr5',
    testAdministratorFirstName: 'zzzTestAdministratorFirstName',
    testAdministratorMiddleName: 'zzzTestAdministratorMiddleName',
    testAdministratorLastName: 'zzzTestAdministratorLastName',
    testAdministratorEmail: 'zzzTestAdministratorEmail',
    testDistrictName: 'zzzTestDistrict',
    testDistrictInitials: 'TD',
    testDistrictNcesId: '123456789',
    testDistrictId: 'yGGlUDTB5xzzCecoYucj',
    testSchoolName: 'zzzTestSchool',
    testSchoolInitials: 'TS',
    testSchoolNcesId: '987654321',
    testClassName: 'zzzTestClass',
    testClassInitials: 'TC',
    testGroupName: 'zzzTestGroup',
    testGroupInitials: 'TG',
    testPartnerAdministrationName: 'zzzCypressTestAdministration',
    testPartnerAdministrationId: 'pdOfQuakqN4re3cI5mr5',
    testPartnerDistrictName: 'zzzCypressTestDistrict',
    testPartnerDistrictInitials: 'CTD',
    testPartnerDistrictNcesId: '123456789',
    testPartnerSchoolName: 'zzzCypressTestSchool',
    testPartnerSchoolInitials: 'CTS',
    testPartnerSchoolNcesId: '987654321',
    testPartnerClassName: 'zzzCypressTestClass',
    testPartnerClassInitials: 'CTC',
    testPartnerGroupName: 'zzzCypressTestGroup',
    testPartnerGroupInitials: 'CTG',
    testGrade: 'Grade 5',
    stanfordUniversityAddress: '450 Jane Stanford Way, Stanford, CA 94305, USA',
    testTag: 'stanford university',
    cypressDownloads: 'cypress/downloads',
    testRoarAppsAdministration: 'zzzCypressTestRoarAppsAdministration',
    testRoarAppsAdministrationId: 'f3UMHUpR8NGLdmACLw9o',
    testUserList: [
      'zzzCypressTestStudent0',
      'zzzCypressTestStudent1',
      'zzzCypressTestStudent2',
      'zzzCypressTestStudent3',
      'zzzCypressTestStudent4',
      'zzzCypressTestStudent5',
      'zzzCypressTestStudent6',
      'zzzCypressTestStudent7',
      'zzzCypressTestStudent8',
      'zzzCypressTestStudent9',
      'zzzCypressTestStudent10',
      'zzzCypressTestStudent11',
      'zzzCypressTestStudent12',
      'zzzCypressTestStudent13',
      'zzzCypressTestStudent14',
      'zzzCypressTestStudent15',
      'zzzCypressTestStudent16',
      'zzzCypressTestStudent17',
      'zzzCypressTestStudent18',
      'zzzCypressTestStudent19',
      'zzzCypressTestStudent20',
    ],
    roarDemoDistrictName: 'Roar Demo District',
    roarDemoDistrictId: 'dfyDUItJNf3wEoG6Mf8H',
    roarDemoAdministrationName: 'ROAR demo administration',
    roarDemoAdministrationId: 'EWC9corgcnipev7ZnmuN',
  },
});
