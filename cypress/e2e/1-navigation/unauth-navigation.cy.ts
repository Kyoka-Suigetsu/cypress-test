describe.skip("Unauthenticated Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.checkLink("logo-link", "/");
    cy.checkLink(
      "calendly-demo",
      "https://calendly.com/lingopal-ai/lingopal-ai-demo",
    );
  });

  it("should load index page", () => {
    cy.dataCy("guest-meeting-form").within((_$form) => {
      cy.dataCy("meeting-id-input").should("have.value", "");
      cy.dataCy("username-input").should("have.value", "");
      cy.dataCy("join-meeting-button")
        .should("be.disabled")
        .and("have.attr", "type", "submit");
    });

    cy.checkLink("login-link", "/login");
  });

  it("should load the login page", () => {
    cy.dataCy("login-link").click();

    cy.dataCy("login-form").within((_$form) => {
      cy.dataCy("email-input").should("have.value", "");
      cy.dataCy("password-input").should("have.value", "");
      cy.dataCy("login-button")
        .should("be.disabled")
        .and("have.attr", "type", "submit");

      cy.dataCy("password-visibility-button");
      cy.checkLink("forget-password-link", "/forget-password");
    });
  });

  //TODO: Implement and add test for forget password page
  it("should return 404 forget-password", () => {
    cy.request({
      url: "/forget-password",
      failOnStatusCode: false, // this will prevent Cypress from failing the test on a non-2xx status code
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it("should load the register page", () => {
    cy.navigateTo("/register");

    cy.dataCy("register-form").within((_$form) => {
      cy.dataCy("name-input").should("have.value", "");
      cy.dataCy("email-input").should("have.value", "");
      cy.dataCy("password-input").should("have.value", "");
      cy.dataCy("confirm-password-input").should("have.value", "");
      cy.dataCy("register-button")
        .should("be.disabled")
        .and("have.attr", "type", "submit");

      cy.dataCy("password-visibility-button");
      cy.dataCy("confirm-password-visibility-button");

      cy.checkLink("login-link", "/login");
    });
  });

  it("navigate from register to login", () => {
    cy.navigateTo("/register");
    cy.dataCy("login-link").click();
    cy.url().should("include", "/login");
  });

  it("should load the Calendly page", () => {
    cy.request({
      url: "https://calendly.com/lingopal-ai/lingopal-ai-demo",
      failOnStatusCode: false, // this will prevent Cypress from failing the test on a non-2xx status code
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("should load the demo page", () => {
    cy.navigateTo("/demo");

    cy.dataCy("demo-microphone-button").should("be.visible").and("be.enabled");

    cy.dataCy("demo-source-language-selector").should("exist");
    cy.dataCy("demo-source-language-selector").should(
      "have.text",
      "Source LanguageEnglish,",
    );

    cy.dataCy("demo-translated-language-selector").should("exist");
    cy.dataCy("demo-translated-language-selector").should(
      "have.text",
      "Translated LanguageSpanish,",
    );
  });
});
