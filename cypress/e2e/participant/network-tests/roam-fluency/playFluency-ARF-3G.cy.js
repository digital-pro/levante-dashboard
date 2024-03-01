import { playFluency } from '../../../../support/helper-functions/roam-fluency/fluencyHelpers';

const timeout = Cypress.env('timeout');
const endText = "You are all done."

describe('Test playthrough of Fluency as a participant', () => {
  it ('Fluency Playthrough Test', () => {
    cy.login(Cypress.env('participantUsername'), Cypress.env('participantPassword'));
    cy.wait(0.3 * timeout);
    cy.visit('/');

    cy.selectAdministration(Cypress.env('testRoarAppsAdministration'));

    cy.get('.p-tabview', {timeout: timeout}).contains('ROAM - Fluency ARF');
    cy.visit(`/game/fluency-arf`);

  //   Click jspsych button to begin
    cy.get('.jspsych-btn', { timeout: 5 * timeout })
    .should('be.visible')
    .click();

   playFluency(endText);

  //  Check if game is marked as complete on the dashboard
  cy.visit('/');
  cy.wait(0.2 * timeout);
  cy.selectAdministration(Cypress.env('testRoarAppsAdministration'));
  cy.get('.tabview-nav-link-label', {timeout: timeout}).contains('ROAM - Fluency ARF')
    .should('have.attr', 'data-game-status', 'complete');

  })
})