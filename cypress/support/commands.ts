/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import { createId } from "@paralleldrive/cuid2";

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: string, timeout?: number): Chainable<JQuery<HTMLElement>>;
      checkLink(selector: string, expectedHref: string): void;
      navigateTo(url: string): void;
      login(): void;
      registerNewUser(): void;
      cleanUser(): void;
      getMeetingIdFromPathname(): Chainable<string>;
      verifyUserInMeeting({}): void;
      setPublicMeetingId(id: string): void;
      setPrivateMeetingId(id: string): void;
      getPublicMeetingId(): Chainable<string>;
      getPrivateMeetingId(): Chainable<string>;
      logout(): void;
      changeSelectValue(
        selectKey: string,
        languageKey: string,
        languageName: string,
      ): void;
      verifySelectValue(selectKey: string, languageName: string): void;
      closeModal(modal: string): void;
    }
  }
}

// -- This is a custom command to select DOM elements by data-cy attribute --
Cypress.Commands.add("dataCy", (value, timeout = 5000) => {
  return cy.get(`[data-cy=${value}]`, { timeout });
});

// -- This is a custom command to check the next link --
Cypress.Commands.add("checkLink", (selector, expectedHref) => {
  cy.dataCy(selector).should("have.attr", "href", expectedHref);
});

Cypress.Commands.add("navigateTo", (url) => {
  cy.visit(url);
  cy.url().should("include", url);
});

Cypress.Commands.add("registerNewUser", () => {
  const userData = {
    name: "Cypress Register Test",
    email: `cypress-test-${createId()}@gmail.com`,
    password: "Cypress123!",
  };

  cy.intercept("POST", "/register").as("register");
  cy.intercept("POST", "/api/auth/callback/credentials").as(
    "credentialsCallback",
  );
  cy.navigateTo("/register");

  cy.dataCy("register-form").within((_$form) => {
    cy.dataCy("name-input").type(userData.name);
    cy.dataCy("email-input").type(userData.email);
    cy.dataCy("password-input").type(userData.password);
    cy.dataCy("confirm-password-input").type(userData.password);
    cy.dataCy("register-button").should("be.enabled");
  });

  cy.dataCy("register-button").click();

  cy.wait("@register").then((interception) => {
    if (interception.response) {
      assert.isNotNull(interception.response.body, "API call has data");
      expect(interception.response.statusCode).to.eq(200);
      expect(userData.name).equal(userData.name);
      expect(userData.email).equal(userData.email);
    } else {
      throw new Error("Response is null");
    }
  });

  cy.wait("@credentialsCallback").then(() => {
    cy.url({ timeout: 10000 }).should("include", "/meeting");
  });

  // cy.location("pathname").should("include", "/meeting");
  // cy.getCookie("next-auth.session-token").should("exist");
  // Cypress.env("newUserEmail" as string, userData.email);
  // Cypress.env("newUserPassword" as string, userData.password);

  // cy.dataCy("create-meeting-form").should("be.visible");
  // cy.dataCy("join-meeting-form").should("be.visible");
});

Cypress.Commands.add("cleanUser", () => {
  cy.request(
    "DELETE",
    "/api/d253d142dfd6874ce55e2ba902036cd4873184e73919c603dbf6e74d77a390d3_remove_cypress_user",
    { email: Cypress.env("newUserEmail") as string },
  );
});

Cypress.Commands.add("login", () => {
  const { email, password } = Cypress.env("userData") as {
    email: string;
    password: string;
  };
  cy.intercept("POST", "/api/auth/callback/credentials").as("login");
  cy.intercept("POST", "**/meeting*").as("page-load");

  cy.navigateTo("/login");
  cy.get("[data-cy=email-input]").type(email);
  cy.get("[data-cy=password-input]").type(password);

  cy.get("[data-cy=login-button]").click();

  cy.wait("@login", { timeout: 10000 }).then((interception) => {
    assert.isNotNull(interception.response!.body, "API call has data");
  });

  cy.wait("@page-load", { timeout: 10000 }).then((interception) => {
    assert.isNotNull(interception.response!.body, "API call has data");
  });
  cy.url().should("include", "/meeting");
});

Cypress.Commands.add("logout", () => {
  cy.intercept("POST", "/api/auth/signout").as("logout");
  cy.dataCy("account-modal-trigger").should("be.visible");

  cy.dataCy("account-modal-trigger").click();
  cy.dataCy("logout-button").click();

  cy.wait("@logout").then((interception) => {
    assert.isNotNull(interception.response!.body, "API call has data");
  });
  cy.url().should("include", "/");
  cy.dataCy("guest-meeting-form").should("be.visible");
});

Cypress.Commands.add("getMeetingIdFromPathname", () => {
  cy.url().then((url) => {
    const pathname = new URL(url).pathname;
    const meetingId = pathname.split("/").pop();
    return meetingId;
  });
});

// Cypress.Commands.add(
//   "verifyUserInMeeting",
//   ({
//     key = email,
//     meetingType = "public",
//   }: { key?: string; meetingType?: string } = {}) => {
//     cy.dataCy("microphone-button", 10000).should("be.enabled");
//     cy.dataCy("active-member-list", 10000).within(() => {
//       cy.contains(key).should("exist");
//     });

//     if (meetingType !== "guest") {
//       cy.dataCy("share-meeting-dropdown-trigger")
//         .should("have.css", "background-color")
//         .then((color) => {
//           if (meetingType === "private") {
//             expect(color).to.equal("rgb(255, 0, 0)");
//           } else if (meetingType === "public") {
//             expect(color).to.equal("rgb(24, 201, 100)");
//           }
//         });
//     }
//   },
// );

Cypress.Commands.add("setPublicMeetingId", (id) => {
  Cypress.env("publicMeetingId", id);
});

Cypress.Commands.add("setPrivateMeetingId", (id) => {
  Cypress.env("privateMeetingId", id);
});

Cypress.Commands.add("getPublicMeetingId", () => {
  return Cypress.env("publicMeetingCode") as Cypress.Chainable<string>;
});

Cypress.Commands.add("getPrivateMeetingId", () => {
  return Cypress.env("privateMeetingCode") as Cypress.Chainable<string>;
});

Cypress.Commands.add(
  "changeSelectValue",
  (selectKey: string, languageKey: string, languageName: string) => {
    cy.dataCy(selectKey).click();
    cy.get("[data-slot=popover]")
      .should("exist")
      .find(`li[data-key="${languageKey}"]`)
      .click();
    cy.verifySelectValue(selectKey, languageName);
    cy.get("[data-slot=popover]").should("not.exist");
  },
);

Cypress.Commands.add(
  "verifySelectValue",
  (selectKey: string, languageName: string) => {
    cy.dataCy(selectKey).within(() => {
      cy.contains(languageName).should("exist");
    });
  },
);

Cypress.Commands.add("closeModal", (modal: string) => {
  cy.dataCy(modal).within(() => {
    cy.get('button[aria-label="Close"]').click();
  });
});
