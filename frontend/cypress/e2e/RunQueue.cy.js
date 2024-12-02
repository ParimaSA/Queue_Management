describe('Add Entry and run queue', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
    let ticket;
  
    before(() => {
      cy.visit(baseURL);
    });
  
    it('Login, add entry and run queue', () => {
        // Login
        cy.get('body > main > div > div > div > a > button').click();
        cy.wait(1000);

        cy.get('input[name="username"]').type('CyTest');
        cy.wait(1000);

        cy.get('input[name="password"]').type('hackme11');
        cy.wait(500);

        cy.get(
            'body > div.flex.justify-center.items-center.min-h-screen.bg-cream2 > ' +
            'div > div > form > ' +
            'div.__className_9b0445.text-center.flex.flex-col.justify-center.items-center > ' +
            'button'
          ).click();     
  
        // Redirect to business page
        cy.url().should('include', '/business');
        cy.wait(3000);

        // Add "Walk-in" entry and check if the queue ticket appear
        cy.get('.select-bordered').should('be.visible')
        cy.get('.select-bordered').select('Walk-in');
        cy.wait(1000);
        cy.contains('button', 'Add').click();
        cy.contains('.card-body p', 'Queue Name: Walk-in').should('be.visible');
        cy.wait(1000);
        
        // Add "Takeaway" entry and check if the queue ticket appear
        cy.get('.select-bordered').should('be.visible').select('Takeaway');
        cy.contains('button', 'Add').click();
        cy.wait(1000);
        cy.contains('button', 'Add').click();
        cy.contains('.card-body p', 'Queue Name: Takeaway').should('be.visible');
        cy.wait(2000);
        
        // Redirect to customer queue ticket
        cy.get('a[href*="queue-management"]')
            .invoke('attr', 'href')
            .then((url) => {
                ticket = url;
                cy.visit(ticket);
            });
        cy.wait(2000);
        cy.contains('h3.text-yellow-900', 'CyRestaurant').should('be.visible');

        // Back to business page
        cy.visit(`${baseURL}/business`);
        cy.wait(2000);

        // Complete queue entry
        cy.get('div')
            .filter((index, element) => {
                const text = Cypress.$(element).text().trim();
                return /C\d+waitingcompletecancel$/.test(text);
            })
            .then((filteredElements) => {
                const entries = Cypress.$(filteredElements).map((index, element) => {
                const text = Cypress.$(element).text().trim();
                const match = text.match(/C\d+/);
                return match ? match[0] : null;
                }).get();

                const smallestEntry = entries
                .map((entry) => {
                    const match = entry.match(/C(\d+)/);
                    return match ? parseInt(match[1], 10) : null;
                })
                .filter((num) => num !== null)
                .sort((a, b) => a - b)[0];

                if (smallestEntry !== undefined) {
                const smallestEntryText = `C${smallestEntry}waitingcompletecancel`;

                cy.get('div')
                    .filter((index, element) => {
                    const text = Cypress.$(element).text().trim();
                    return new RegExp(`^${smallestEntryText}$`).test(text);
                    })
                    .find('button')
                    .first()
                    .click({ force: true })
                    
                cy.log(`Smallest Entry: C${smallestEntry}`);
                } else {
                cy.log('No valid entries found.');
                }
            });

        cy.wait(1000);
        cy.wrap(null).then(() => {
            cy.visit(ticket);
        });
        cy.contains('h3.text-yellow-900', 'CyRestaurant').should('be.visible');
          
  
    });   
});
  