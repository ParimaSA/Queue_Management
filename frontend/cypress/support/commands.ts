/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (username: string, password: string) => {
    cy.visit('https://queue-management-taupe.vercel.app/business/login')
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
        cy.wait(500);

    cy.get(
        'body > div.flex.justify-center.items-center.min-h-screen.bg-cream2 > ' +
        'div > div > form > ' +
        'div.__className_9b0445.text-center.flex.flex-col.justify-center.items-center > ' +
         'button'
        ).click();     
  });
  
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
    }
  }
}

export {}; 