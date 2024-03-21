describe("Demo Timeout", () => {
  it("should timeout demo in 1 min after started", () => {
    // This test will timeout
    cy.navigateTo("/demo");
    cy.clock();
    cy.dataCy("demo-microphone-button").should("be.visible").and("be.enabled");
    cy.dataCy("demo-microphone-button").click();

    cy.dataCy("demo-chip-timer").should("be.visible");
    cy.tick(60000);
    cy.dataCy("demo-timeout-modal").should("be.visible");
    cy.checkLink(
      "demo-timeout-modal-calendly-link",
      "https://calendly.com/lingopal-ai/lingopal-ai-demo",
    );
  });
});
