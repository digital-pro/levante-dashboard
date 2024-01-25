describe('Test playthrough of SRE as a participant', () => {
  it('ROAR-Sentence Playthrough Test', () => {
    cy.login(Cypress.env('participantUsername'), Cypress.env('participantPassword'));
    cy.visit('/');

    cy.get('.p-dropdown-trigger', { timeout: 10000 }).should('be.visible').click();
    cy.get('.p-dropdown-item', { timeout: 10000 })
      .contains('ZZZ Test Shortened SRE')
      .should('be.visible')
      .click();

    cy.get('.p-tabview').contains('ROAR-Sentence');
    cy.visit(`/game/sre`);

    cy.get('.jspsych-btn', { timeout: 60000 }).should('be.visible').click();

    cy.wait(500);

    cy.get('b').contains('I agree').click();
    cy.get('.jspsych-btn', { timeout: 10000 }).should('be.visible').click();
    cy.get('.jspsych-btn', { timeout: 10000 }).should('be.visible').click();

    // handles error where full screen throws a permissions error
    cy.wait(500);
    Cypress.on('uncaught:exception', () => {
      return false;
    });

    playSREGame();
    // check if game completed
    cy.get('.p-dropdown-trigger', { timeout: 50000 }).should('be.visible').click();
    cy.get('.p-dropdown-item', { timeout: 10000 }).contains('ZZZ Test Cypress Play Keypress Games').should('be.visible').click();
    cy.get('.tabview-nav-link-label').contains('ROAR-Sentence').should('have.attr', 'data-game-status', 'complete');
  });
});

function playSREGame() {
  // play tutorial
  for (let i = 0; i < 4; i++) {
    cy.wait(1000);
    cy.get('body').type('{leftarrow}{rightarrow}');
    cy.wait(1000);
    cy.get('body').type('{leftarrow}{rightarrow}');
  }

  // continue twice
  cy.get('body').type('{leftarrow}');
  cy.get('body').type('{leftarrow}');

  for (let i = 0; i < 5; i++) {
    cy.log("loop 1", i)
    assert(cy.get('.stimulus').should('be.visible'));
    cy.get('body').type('{leftarrow}');
    cy.wait(600);
    cy.get('.stimulus').should('be.visible');
    cy.get('body').type('{rightarrow}');
    cy.wait(600);
  }

  cy.wait(4000);
  cy.get('body').type('{rightarrow}');
  assert(cy.contains('You are halfway through'));
  cy.get('body').type('{rightarrow}');

  for (let i = 0; i < 5; i++) {
    cy.log("loop 2", i)
    cy.get('.stimulus').should('be.visible');
    cy.get('body').type('{leftarrow}');
    cy.wait(600);
    cy.get('.stimulus').should('be.visible');
    cy.get('body').type('{rightarrow}');
    cy.wait(600);
  }

  cy.wait(4000);
  cy.get('body').type('{rightarrow}{leftarrow}');
  cy.wait(600);
  assert(cy.contains('Amazing job!'));
  cy.get('body').type('{enter}');
}

// function playSREGame() {
//   // play tutorial
//   for (let i = 0; i < 4; i++) {
//     cy.get('body').type('{leftarrow}{rightarrow}');
//     cy.get('body').type('{leftarrow}{rightarrow}');
//   }
//
//   // continue twice
//   cy.get('body').type('{leftarrow}');
//   cy.get('body').type('{leftarrow}');
//
//   // Execute the first block
//   // Cycle through all the stimuli until the text "You are halfway through" appears on screen
//   let halfwayThrough = false;
//
//   function checkHalfway() {
//     cy.get('body', {timeout: Cypress.env("timeout")}).then(($body) => {
//       if ($body.text().includes("You are halfway through - let's keep going.")) {
//         halfwayThrough = true;
//         console.log("halfway through", halfwayThrough)
//       } else {
//         assert(cy.get('.stimulus').should('be.visible'));
//         cy.get('body', {timeout: Cypress.env("timeout")}).type('{leftarrow}', {timeout: Cypress.env("timeout")});
//         console.log("halfway through", halfwayThrough)
//         cy.wait(2000)
//         checkHalfway(); // call itself
//       }
//     });
//   }
//
//   checkHalfway();
//
//   if (halfwayThrough) {
//     assert(cy.contains("You are halfway through - let's keep going."));
//     cy.get('body').type('{enter}');
//
//     // Execute the second block
//     for (let i = 0; i < 7; i++) {
//       cy.get('.stimulus').should('be.visible');
//       cy.get('body').type('{leftarrow}');
//       cy.get('.stimulus').should('be.visible');
//       cy.get('body').type('{rightarrow}');
//     }
//
//     cy.get('body').type('{rightarrow}{leftarrow}');
//     assert(cy.contains('Amazing job!'));
//   }
// }
