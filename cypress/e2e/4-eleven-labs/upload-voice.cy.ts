describe("Upload Voice Vie Eleven Labs", () => {

  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it("should upload voice from file", () => {
  // TODO: Find out why endpoint is failing and test again
  //  cy.dataCy("voice-cloning-modal-trigger").should("be.visible").click();
  //   cy.dataCy("voice-cloning-modal").should("be.visible");

  //   cy.dataCy("voice-cloning-form").should("be.visible");
  //   cy.dataCy("voice-cloning-name-input").should("be.visible").type("Cypress Test");

  //   cy.dataCy("voice-cloning-dropzone").should("be.visible");
  //   cy.dataCy("voice-cloning-dropzone").selectFile("cypress/fixtures/test.mp3", {action: "drag-drop"});
  //   cy.dataCy("voice-cloning-dropzone").click();

  //   cy.dataCy("voice-cloning-submit-button").should("be.visible").click();
  });
})