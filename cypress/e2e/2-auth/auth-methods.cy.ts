describe("Auth Functions", () => {
  it("should register a new user", () => {
    cy.registerNewUser();
    cy.logout();
    cy.cleanUser();
  });

  it("should login the user", () => {
    cy.registerNewUser();
    cy.logout();

    cy.intercept("POST", "/api/auth/callback/credentials").as("login");
    cy.navigateTo("/login");

    cy.dataCy("login-form").within((_$form) => {
      cy.dataCy("email-input").type(Cypress.env("newUserEmail") as string);
      cy.dataCy("password-input").type(
        Cypress.env("newUserPassword") as string,
      );
      cy.dataCy("login-button").should("be.enabled");
    });

    cy.dataCy("login-button").click();

    cy.wait("@login").then((interception) => {
      assert.isNotNull(interception.response!.body, "API call has data");
    });

    cy.url().should("include", "/meeting");
    cy.cleanUser();
  });

  it("should logout the user", () => {
    cy.login();
    cy.logout();
  });
});
