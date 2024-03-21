describe("Create Meetings ", () => {
  beforeEach(() => {
    cy.registerNewUser();
  });

  afterEach(() => {
    cy.cleanUser();
  });
  it("should create a new public meeting", () => {
    cy.dataCy("create-meeting-form").within((_$form) => {
      cy.dataCy("meeting-id-input").should("exist");
      cy.dataCy("meeting-name-input").should("have.value", "");
      cy.dataCy("meeting-name-input").type("Cypress Meeting");
      cy.dataCy("private-meeting-switch")
        .find("input")
        .should("be.not.checked");
      cy.dataCy("create-meeting-button").should("be.enabled").click();
    });

    cy.verifyUserInMeeting({
      key: Cypress.env("newUserEmail") as string,
      meetingType: "public",
    });
  });

  it("should create a new private meeting", () => {
    cy.dataCy("create-meeting-form").within((_$form) => {
      cy.dataCy("meeting-id-input").should("exist");
      cy.dataCy("meeting-name-input").should("have.value", "");
      cy.dataCy("meeting-name-input").type("Cypress Meeting");
      cy.dataCy("private-meeting-switch").click();
      cy.dataCy("private-meeting-switch").find("input").should("be.checked");
      cy.dataCy("create-meeting-button").should("be.enabled").click();
    });

    cy.verifyUserInMeeting({
      key: Cypress.env("newUserEmail") as string,
      meetingType: "private",
    });
  });
});

describe("Join Meetings", () => {
  beforeEach(() => {
    cy.registerNewUser();
  });

  afterEach(() => {
    cy.cleanUser();
  });
  it("should join a public meeting with code", () => {
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.dataCy("join-meeting-form").within((_$form) => {
        cy.dataCy("meeting-id-input").should("have.value", "");
        cy.dataCy("meeting-id-input").type(`${meetingId}`);
        cy.dataCy("join-meeting-button").should("be.enabled").click();
      });
    });
    cy.verifyUserInMeeting({
      key: Cypress.env("newUserEmail") as string,
      meetingType: "public",
    });
  });

  it("should remain in meeting after page reload", () => {
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.navigateTo(`/meeting/${meetingId}`);
    });

    cy.verifyUserInMeeting({
      key: Cypress.env("newUserEmail") as string,
      meetingType: "public",
    });
    cy.reload();
    cy.verifyUserInMeeting({
      key: Cypress.env("newUserEmail") as string,
      meetingType: "public",
    });
  });
});

describe("Join as Guest", () => {
  it("should join public meeting as Guest", () => {
    cy.navigateTo("/");
    cy.getPublicMeetingId().then((meetingId: string) => {
      cy.dataCy("guest-meeting-form").within((_$form) => {
        cy.dataCy("meeting-id-input").type(`${meetingId}`);
        cy.dataCy("username-input").type("Cypress Guest");
        cy.dataCy("join-meeting-button").should("be.enabled").click();
      });
    });

    cy.verifyUserInMeeting({ key: "Cypress Guest", meetingType: "guest" });
  });
});
