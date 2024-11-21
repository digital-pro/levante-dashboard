import { playCALF } from '../../../../support/helper-functions/roam-apps/roamHelpers';
import { isCurrentVersion } from '../../../../support/utils';

const administration = Cypress.env('testSpanishRoarAppsAdministration');
const language = 'es';
const task = 'fluency-calf-es';
const endText = 'Has terminado.';
const continueText = 'continuar';

const app = '@bdelab/roam-apps';

describe('Test playthrough of ROAM CALF-ES as a participant', () => {
  if (Cypress.env('isLevante')) {
    it.skip('skipped -- levante');
  } else {
    it('ROAM Playthrough Test', () => {
      cy.wrap(isCurrentVersion(app)).then((isCurrentVersion) => {
      if (isCurrentVersion) {
        cy.log(`Did not detect a new version of ${app}, skipping test.`);
      } else {
        cy.log(`Detected a new version of ${app}, running test.`);
        playCALF({
          administration: administration,
          language: language,
          task: task,
          endText: endText,
          continueText: continueText,
        });
      }
      });
    });
  }
});
