import { playPA } from '../../../support/helper-functions/roar-pa/paHelpers';

// const timeout = Cypress.env('timeout');
// const startText = 'In this game we are going to look for words that BEGIN with the same sound.';
// const endBlockText = {
//   endText1: 'Take a break if needed',
//   endText2: 'I have been swimming so much',
//   endText3: 'You have helped me and all my friends!',
// };
// const breakBlockText = 'Take a break if needed';
// const breakBlockText2 = {
//   break1: 'Great job',
//   break2: 'Look at all those carrots',
//   break3: 'You are doing great',
// };

describe('Testing playthrough of ROAR-Phoneme as a participant', () => {
  it(`ROAR-Phoneme Playthrough Test`, () => {
    playPA();
  });
});
