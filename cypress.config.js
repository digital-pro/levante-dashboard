const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  projectId: 'cobw62',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://localhost:5173/',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    // retries: 2,
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
    testAdministrationName: 'Cypress Test Administration',
    testAdministrationId: '',
    testAdministratorFirstName: 'Cypress Test Administrator First Name',
    testAdministratorMiddleName: 'Cypress Test Administrator Middle Name',
    testAdministratorLastName: 'Cypress Test Administrator Last Name',
    testAdministratorEmail: 'CypressTestAdministratorEmail',
    testDistrictName: 'Cypress Test District',
    testDistrictInitials: 'SATD',
    testDistrictNcesId: '0123456789',
    testDistrictId: '',
    testSchoolName: 'Cypress Test School',
    testSchoolInitials: 'SATS',
    testSchoolNcesId: '0123456789',
    testClassName: 'Cypress Test Class',
    testClassInitials: 'SATC',
    testGroupName: 'Cypress Test Group',
    testGroupInitials: 'SATG',
    testAssignmentsList: ['Vocabulary', 'Multichoice', 'Written-Vocab'],
    testPartnerAdministrationName: 'Partner Test Administration',
    testPartnerAdministrationId: 'pdOfQuakqN4re3cI5mr5',
    testPartnerDistrictName: 'Cypress Test District',
    testPartnerDistrictInitials: 'CTD',
    testPartnerDistrictNcesId: '0123456789',
    testPartnerSchoolName: 'Cypress Test School',
    testPartnerSchoolInitials: 'CTD-CTS',
    testPartnerSchoolNcesId: '0123456789',
    testPartnerClassName: 'Cypress Test Class',
    testPartnerClassInitials: 'CTD-CTS-CTC',
    testPartnerGroupName: 'Cypress Test Group',
    testPartnerGroupInitials: 'CTG',
    testGrade: 'Grade 5',
    stanfordUniversityAddress: '450 Jane Stanford Way, Stanford, CA 94305, USA',
    testTag: 'stanford university',
    cypressDownloads: 'cypress/downloads',
    testRoarAppsAdministration: 'Cypress Test Roar Apps Administration',
    testRoarAppsAdministrationId: '',
    testOptionalRoarAppsAdministration: 'Cypress Test Optional Roar Apps Administration',
    testOptionalRoarAppsAdministrationId: '',
    testSpanishRoarAppsAdministration: 'Cypress Test Spanish Roar Apps Administration',
    testSpanishRoarAppsAdministrationId: '',
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
      'zzzCypressTestStudent21',
    ],
    roarDemoDistrictName: 'Roar Demo District',
    roarDemoDistrictId: 'dfyDUItJNf3wEoG6Mf8H',
    roarDemoAdministrationName: 'ROAR demo administration',
    roarDemoAdministrationId: 'EWC9corgcnipev7ZnmuN',
  },
});
