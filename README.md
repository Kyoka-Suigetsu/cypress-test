# Rooms



## Quickstart

1. Install node - https://nodejs.org/en/download

2. Install packages
```
$ npm install / pnpm install
```

3. Request the latest environment variables from an existing contributor or from the #environment-variables slack chat, and place it in a .env file in the root of the project.

4. Run development server
```
$ npm run dev / pnpm dev
```

# Cypress E2E Testing

## Recommended VSCode Extension 

#### [Cypress Fixture-IntelliSense:](https://marketplace.visualstudio.com/items?itemName=JosefBiehler.cypress-fixture-intellisense) Supports your cy.fixture() by providing intellisense for existing fixtures.
#### [Cypress Helper:](https://marketplace.visualstudio.com/items?itemName=shevtsov.vscode-cy-helper) Various helpers and commands for integration with Cypress.
#### [Cypress Snippets:](https://marketplace.visualstudio.com/items?itemName=andrew-codes.cypress-snippets) Useful Cypress code snippets.
#### [Cypress Snippets:](https://marketplace.visualstudio.com/items?itemName=CliffSu.cypress-snippets) This extension includes the newest and most common cypress snippets.

## Writing Test

1. Build the current version of the application you are about to test
```
$ pnpm next build
```
2. Start the development server
```
$ pnpm next start
```
3. Open Cypress
```
$ pnpm cypress open
```
4. Select E2E Testing
5. Select your browser of choice for testing, else choose Electron.
6. Follow the [Cypress Docs](https://docs.cypress.io/guides/overview/why-cypress) along with [Cypress Commands](https://example.cypress.io/) to write your test
#### All E2E test can be located in the *cypress/e2e/* path in the project.
7. Create a new spec 
#### You can create from the Cypress App or by adding a file in the e2e folder with for spec_name.cy.ts
8. All specs will automatically show appear in the Cypress App, click on your spec to run the test.
9. Finally before making your PR, run all test to verify your results. You can use 
```
$ pnpm cypress run
```

