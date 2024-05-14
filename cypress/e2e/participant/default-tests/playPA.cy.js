import { playPA } from '../../../support/helper-functions/roar-pa/paHelpers';
import { isCurrentVersion } from '../../../support/utils';

const app = '@bdelab/roar-pa';

describe('Testing playthrough of ROAR-Phoneme as a participant', () => {
  it(`ROAR-Phoneme Playthrough Test`, () => {
    isCurrentVersion(app).then((isCurrentVersion) => {
      if (isCurrentVersion) {
        cy.log(`Did not detect a new version of ${app}, skipping test.`);
      } else {
        cy.log(`Detected a new version of ${app}, running test.`);
        playPA();
      }
    });
  });
});
