describe.skip("FontSize Preferences", () => {
  beforeEach(() => {
    cy.viewport(1400, 768);
    cy.registerNewUser();
  });

  afterEach(() => {
    cy.cleanUser();
  });

  it("should change the font size", () => {
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.navigateTo(`/meeting/${meetingId}`);
      cy.verifyUserInMeeting({
        key: Cypress.env("newUserEmail") as string,
        meetingType: "public",
      });

      cy.dataCy("settings-modal-trigger").click();
      cy.dataCy("settings-modal").should("be.visible");

      cy.dataCy("settings-font-size-select").should("be.visible");
      cy.verifySelectValue("settings-font-size-select", "16");
      cy.changeSelectValue("settings-font-size-select", "12", "12");
      cy.closeModal("settings-modal");

      cy.dataCy("settings-modal-trigger").click();
      cy.dataCy("settings-modal").should("be.visible");
      cy.verifySelectValue("settings-font-size-select", "12");
      cy.changeSelectValue("settings-font-size-select", "16", "16");
      cy.closeModal("settings-modal");
    });
  });
});
