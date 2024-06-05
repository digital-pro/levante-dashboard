export const generatedSpecTemplate = (adminName) => {
  return `
  import { testSpecs } from "../../../fixtures/taskTestSpecs.js";
  const timeout = Cypress.env('timeout');

  function testGame(spec, admin) {
    cy.wait(0.1 * timeout);
    cy.get('.p-tabview')
      .invoke('text')
      .then((text) => {
        if (text.includes(spec.name)) {
          cy.log(\`Initializing test for game: \${spec.name}\`);
  
          spec.spec({
            administration: admin,
            language: spec.language,
          });
        } else {
          checkOptionalGame(spec, admin, text);
        }
      });
  }

  describe('Testing individual synced administration', () => {
    it('Tests a synced administration', () => {
      cy.login(Cypress.env('participantUsername'), Cypress.env('participantPassword'));
      cy.visit('/', { timeout: 2 * timeout });
      cy.selectAdministration('${adminName}');
      testSpecs.forEach((spec) => {
        testGame(spec, '${adminName}');
      });
      cy.log(\`Found administration: ${adminName}\`);
    });
  });
  `;
};
