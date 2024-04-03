import { randomizeOrgName } from '../../../support/utils';
import {
  selectOrgFromDropdown,
  checkOrgCreated,
  clickCreateOrg,
  inputParentOrgDetails,
} from '../../../support/helper-functions/super-admin/superAdminHelpers';

const randomDistrictName = randomizeOrgName(Cypress.env('testDistrictName'));
const randomSchoolName = randomizeOrgName(Cypress.env('testSchoolName'));
const randomClassName = randomizeOrgName(Cypress.env('testClassName'));
const randomGroupName = randomizeOrgName(Cypress.env('testGroupName'));

const randomOrgs = [
  { orgType: 'District', name: randomDistrictName, initials: 'CTD', grade: null },
  { orgType: 'School', name: randomSchoolName, initials: 'CTS', parentDistrict: randomDistrictName, grade: null },
  {
    orgType: 'Class',
    name: randomClassName,
    initials: 'CTC',
    parentDistrict: randomDistrictName,
    parentSchool: randomSchoolName,
    grade: 5,
  },
  { orgType: 'Group', name: randomGroupName, initials: 'CTG' },
];

describe('The admin user can create a set of test orgs', () => {
  randomOrgs.forEach((org) => {
    it(`Creates a test ${org.orgType}`, () => {
      cy.login(Cypress.env('superAdminUsername'), Cypress.env('superAdminPassword'));
      cy.navigateTo('/create-orgs');
      cy.log(`Creating a ${org.orgType.toLowerCase()} named ${org.name}`);
      selectOrgFromDropdown(org.orgType.toLowerCase());
      inputParentOrgDetails(org.orgType, org?.parentDistrict, org?.parentSchool);
      cy.inputOrgDetails(org.name, org.initials, null, null, org.grade, Cypress.env('testTag'));
      clickCreateOrg(org.orgType);
      // allow time for the org to be created
      cy.wait(Cypress.env('timeout'));
      cy.navigateTo('/list-orgs');
      checkOrgCreated(org.name, org.orgType, org.parentDistrict, org.parentSchool);
    });
  });
});
