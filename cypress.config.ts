import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
    env: {
      userData: {
        email: "cypress-test-login@gmail.com",
        password: "Cypress123!",
      },
      publicMeetingCode:"Nb3H-",
      privateMeetingCode:"EhRON",
    },
  },
});
