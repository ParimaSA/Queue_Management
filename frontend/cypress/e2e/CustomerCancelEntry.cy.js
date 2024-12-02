describe('Add Entry and run queue', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
    let ticket;
  
    before(() => {
      cy.visit(baseURL);
    });
  
    it('Login, add entry and run queue', () => {
        // Login
        cy.login('CyTest', 'hackme11');

        cy.url().should('include', '/business');
        cy.wait(3000)
  
        // Redirect to business page
        cy.url().should('include', '/business');
        cy.wait(3000);

        // Add "Reservation" entry and check if the queue ticket appear
        cy.get('.select-bordered').should('be.visible')
        cy.get('.select-bordered').select('Reservation');
        cy.wait(1000);
        cy.contains('button', 'Add').click();
        cy.contains('.card-body p', 'Queue Name: Reservation').should('be.visible');
        cy.wait(1000);

        // Redirect to customer queue ticket
        cy.get('a[href*="queue-management"]')
            .invoke('attr', 'href')
            .then((url) => {
                ticket = url;
                cy.visit(ticket);
            });
        cy.wait(2000);
        cy.contains('h3.text-yellow-900', 'CyRestaurant').should('be.visible');
        
        // Cancel entry from customer queue ticket page
        cy.get('body > div.bg-cream2.w-screen.h-screen.flex.justify-center.items-center > div > div > button').click()
        
        // Check No queue entry found page
        cy.get('body > main > div > div > div > h1').contains('No queue entry found.').should('be.visible')
    });   
});