describe('Customer cancel queue entry', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
    let ticket;
  
    before(() => {
      cy.visit(baseURL);
    });
  
    it('Customer cancel queue entry', () => {
        // Login
        cy.login('CyTest', 'hackme11');

        cy.url().should('include', '/business');
        cy.wait(3000)
  
        // Redirect to business page
        cy.url().should('include', '/business');
        cy.wait(3000);

        // Delete all queue
        cy.get('button.btn.bg-lightPurple1.hover\\:bg-purple.rounded-full')
            .should('be.visible')
            .find('svg.size-6.text-black')
            .click({ force: true })
        cy.wait(2000)
        
        // Add queue template
        cy.contains('button', 'Queue Template').click();
        cy.contains('button', 'Restaurant').click();

        cy.get('#modal_template > div').scrollTo('bottom');
        cy.contains('button', 'Add Restaurant Template').click();

        // Add "Walk-in" entry and check if the queue ticket appear
        cy.wait(3000)
        cy.get('.select-bordered').should('be.visible')
        cy.get('.select-bordered').select('Walk-in');
        cy.wait(1000);
        cy.contains('button', 'Add').click();
        cy.wait(2000)
        cy.contains('.card-body p', 'Queue Name: Walk-in').should('be.visible');
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