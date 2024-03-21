describe("Language Preferences", () => {
  beforeEach(() => {
    cy.viewport(1400, 768);
    cy.registerNewUser();
  });

  afterEach(() => {
    cy.cleanUser();
  });

  it("should change language with account settings", () => {
    cy.dataCy("account-modal-trigger").click();
    cy.verifySelectValue("account-language-selector", "English");
    cy.changeSelectValue("account-language-selector", "spa_Latn", "Spanish");
    cy.closeModal("account-modal");

    cy.dataCy("account-modal-trigger").click();
    cy.verifySelectValue("account-language-selector", "Spanish");
    cy.changeSelectValue("account-language-selector", "eng_Latn", "English");
    cy.closeModal("account-modal");
  });

  it("should change language with meeting settings", () => {
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.navigateTo(`/meeting/${meetingId}`);
      cy.verifyUserInMeeting({
        key: Cypress.env("newUserEmail") as string,
        meetingType: "public",
      });

      cy.verifySelectValue("language-select", "English");
      cy.changeSelectValue("language-select", "es", "Spanish");
      cy.dataCy("microphone-button").should("be.enabled");

      cy.verifySelectValue("language-select", "Spanish");
      cy.changeSelectValue("language-select", "en", "English");
      cy.verifySelectValue("language-select", "English");
      cy.dataCy("microphone-button").should("be.enabled");
    });
  });

  // TODO: Test this when fix for language sync merged
  // it("should change and language and reflect in both selects", () => {
  //   cy.getPublicMeetingId().then((meetingId: string) => {
  //     cy.navigateTo(`/meeting/${meetingId}`);
  //     cy.verifyUserInMeeting({ meetingType: "public" });

  //     cy.verifyLanguage("language-select", "English");
  //     cy.changeLanguage("language-select", "es", "Spanish");
  //     cy.dataCy("microphone-button").should("be.enabled");

  //     cy.dataCy("account-modal-trigger").click();
  //     cy.verifyLanguage("account-language-selector", "Spanish");
  //     cy.changeLanguage("account-language-selector", "eng_Latn", "English");
  //     cy.closeModal("account-modal");
  //     cy.dataCy("microphone-button").should("be.enabled");

  //     cy.verifyLanguage("language-select", "English");
  //   });
  // });
});
