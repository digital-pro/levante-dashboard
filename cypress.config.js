const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  projectId: 'cobw62',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://localhost:5173',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    retries: 2,
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        isCurrentVersion() {
          const { execSync } = require('child_process');
          const fs = require('fs');

          // Get the version number from the package.json in the main branch
          const mainPackageJson = execSync('git show origin/main:package.json', { encoding: 'utf-8' });
          const mainVersion = JSON.parse(mainPackageJson).version;

          // Get the version number from the current package.json
          const currentPackageJson = fs.readFileSync('./package.json', 'utf-8');
          const currentVersion = JSON.parse(currentPackageJson).version;

          // Compare the version numbers
          return currentVersion === mainVersion;
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
    testAdministrationId: 'kKUSypkMc36mPEzleDE6',
    testAdministratorFirstName: 'Cypress Test Administrator First Name',
    testAdministratorMiddleName: 'Cypress Test Administrator Middle Name',
    testAdministratorLastName: 'Cypress Test Administrator Last Name',
    testAdministratorEmail: 'CypressTestAdministratorEmail',
    testDistrictName: 'Cypress Test District',
    testDistrictInitials: 'SATD',
    testDistrictNcesId: '0123456789',
    testDistrictId: 'qoW9OEPcV50rIA2IcqbV',
    testSchoolName: 'Cypress Test School',
    testSchoolInitials: 'SATS',
    testSchoolNcesId: '0123456789',
    testClassName: 'Cypress Test Class',
    testClassInitials: 'SATC',
    testGroupName: 'Cypress Test Group',
    testGroupInitials: 'SATG',
    testAssignmentsList: [
      'Letter',
      'Picture-Vocab',
      'Single Digit Fluency',
      'Multi Digit Fluency',
      'Syntax',
      'Phoneme',
      'Word',
      'Sentence',
      'Morphology',
    ],
    testPartnerAdministrationName: 'Partner Test Administration',
    testPartnerAdministrationId: 'kKUSypkMc36mPEzleDE6',
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
    testRoarAppsAdministrationId: 'K8UaI8p79Dntj5Z2CJk8',
    testOptionalRoarAppsAdministration: 'Cypress Test Optional Roar Apps Administration',
    testOptionalRoarAppsAdministrationId: '',
    testSpanishRoarAppsAdministration: 'Cypress Test Spanish Roar Apps Administration',
    testSpanishRoarAppsAdministrationId: '',
    // Generate a list of test users CypressTestStudent0, CypressTestStudent1, ..., CypressTestStudent50
    testUserList: Array.from({ length: 51 }, (_, i) => `CypressTestStudent${i}`),
    roarDemoDistrictName: 'Roar Demo District',
    roarDemoDistrictId: 'dfyDUItJNf3wEoG6Mf8H',
    roarDemoAdministrationName: 'ROAR demo administration',
    roarDemoAdministrationId: 'EWC9corgcnipev7ZnmuN',
  },
});
