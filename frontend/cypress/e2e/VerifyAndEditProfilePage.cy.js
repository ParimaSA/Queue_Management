describe('Verify and edit profile', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
    let ticket;
  
    before(() => {
      cy.visit(baseURL);
    });
  
    it('Verify and edit profile page', () => {
        // Login
        cy.login('CyTest', 'hackme11');

        cy.url().should('include', '/business');

        // Navigate to Profile page
        cy.contains('summary', 'Account').click();
        cy.contains('a', 'Profile').click();
  
        // Verify correct business name
        cy.contains('CyRestaurant').should('be.visible');

        // Edit business name
        cy.get('button.btn.rounded-full').contains('Edit').click();
        cy.get('input[placeholder="CyRestaurant"]')
            .clear()
            .type('CyRestaurantNew');
        
        // Edit open and close time
        cy.get('input[placeholder="06:00:00"]')
            .clear()
            .type('08:00:00');

        cy.get('input[placeholder="23:59:00"]')
            .clear()
            .type('22:00:00');

        cy.get('button').contains('Save').click();

        // Verify correct new business name
        cy.contains('CyRestaurantNew').should('be.visible');
        cy.wait(1000)

        // Verify new open time and close time
        cy.get('button.btn.rounded-full').contains('Edit').click();

        cy.get('input[placeholder="08:00:00"]').should('be.visible')
        cy.get('input[placeholder="22:00:00"]').should('be.visible')

        // Change everything back
        cy.get('input[placeholder="CyRestaurantNew"]')
            .clear()
            .type('CyRestaurant');
    
        cy.get('input[placeholder="08:00:00"]')
            .clear()
            .type('06:00:00');

        cy.get('input[placeholder="22:00:00"]')
            .clear()
            .type('23:59:00');

        cy.get('button').contains('Save').click();

        // Check statistic
        // Summary
        cy.get('div.tab-content')
            .find('h1')
            .contains('Entry Status')
            .should('be.visible');

        //Time
        cy.get('input[role="tab"][aria-label="Time"]').click().should('be.checked');
        cy.contains('h2.card-title.text-black', 'Time Slot Entries Chart').should('be.visible');
        cy.contains('h2.card-title.text-black', 'Waiting Time by Time Slot Chart').should('be.visible');

        // Day
        cy.get('input[role="tab"][aria-label="Day"]').click().should('be.checked');
        cy.contains('h2.card-title.text-black', 'Average Weekly Entries Chart').should('be.visible');
        cy.contains('h2.card-title.text-black', 'Waiting Time by Day Chart').should('be.visible');

        // Queue
        cy.get('input[role="tab"][aria-label="Queue"]').click().should('be.checked');
        cy.contains('h2.card-title.text-black', 'Queue Entries Chart').should('be.visible');
        cy.contains('h2.card-title.text-black', 'Waiting Time by Queue Chart').should('be.visible');
    });   
});
