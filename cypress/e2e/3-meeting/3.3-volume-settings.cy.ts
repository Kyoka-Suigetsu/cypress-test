describe.skip("Volume Preferences", () => {
  beforeEach(() => {
    cy.viewport(1400, 768);
    cy.registerNewUser();
  });

  afterEach(() => {
    cy.cleanUser();
  });

  it("should mute/unmute with meeting settings", () => {
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.navigateTo(`/meeting/${meetingId}`);
      cy.verifyUserInMeeting({
        key: Cypress.env("newUserEmail") as string,
        meetingType: "public",
      });

      cy.dataCy("settings-modal-trigger").click();
      cy.dataCy("settings-modal").should("be.visible");
      cy.dataCy("settings-mute-switch").find("input").should("be.checked");
      cy.dataCy("settings-mute-switch").click();

      cy.dataCy("settings-mute-switch").find("input").should("be.not.checked");
      cy.closeModal("settings-modal");

      cy.dataCy("settings-modal-trigger").click();
      cy.dataCy("settings-modal").should("be.visible");
      cy.dataCy("settings-mute-switch").find("input").should("be.not.checked");
      cy.dataCy("settings-mute-switch").click();
      cy.dataCy("settings-mute-switch").find("input").should("be.checked");
      cy.closeModal("settings-modal");
    });
  });

  it("should change volume with account settings", () => {
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.navigateTo(`/meeting/${meetingId}`);
      cy.verifyUserInMeeting({
        key: Cypress.env("newUserEmail") as string,
        meetingType: "public",
      });

      cy.dataCy("settings-modal-trigger").click();
      cy.dataCy("settings-modal").should("be.visible");
      cy.dataCy("settings-volume-slider").should("be.visible");
      cy.dataCy("settings-volume-slider")
        .find('[data-slot="track"]')
        .click("right");

      cy.dataCy("settings-volume-slider")
        .find("input")
        .invoke("val")
        .should("eq", "100");
      cy.dataCy("settings-volume-slider").click();
      cy.closeModal("settings-modal");

      cy.dataCy("settings-modal-trigger").click();
      cy.dataCy("settings-modal").should("be.visible");
      cy.dataCy("settings-volume-slider")
        .find("input")
        .invoke("val")
        .should("eq", "50");
      cy.dataCy("settings-volume-slider")
        .find('[data-slot="track"]')
        .click("right");
      cy.dataCy("settings-volume-slider")
        .find("input")
        .invoke("val")
        .should("eq", "100");
      cy.closeModal("settings-modal");
    });
  });
});
