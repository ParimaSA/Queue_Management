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
    cy.visit('https://queue-management-taupe.vercel.app/business/login');
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

// -- Add custom cursor commands --
Cypress.Commands.add('createCursor', () => {
    cy.window().then((win) => {
        if (!win.document.getElementById('cypress-cursor')) {
            const cursor = win.document.createElement('div');
            cursor.setAttribute('id', 'cypress-cursor');
            cursor.style.position = 'absolute';
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'red';
            cursor.style.borderRadius = '50%';
            cursor.style.zIndex = '9999';
            cursor.style.pointerEvents = 'none';
            cursor.style.transition = 'all 0.3s ease';
            win.document.body.appendChild(cursor);
        }
    });
});

Cypress.Commands.add('moveCursorTo', (selector: string) => {
    cy.get(selector).then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        cy.window().then((win) => {
            const cursor = win.document.getElementById('cypress-cursor');
            if (cursor) {
                cursor.style.left = `${rect.left + win.scrollX + rect.width / 2}px`;
                cursor.style.top = `${rect.top + win.scrollY + rect.height / 2}px`;
            }
        });
    });
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
            createCursor(): Chainable<void>;
            moveCursorTo(selector: string): Chainable<void>;
            drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
            dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
        }
    }
}

export {};
