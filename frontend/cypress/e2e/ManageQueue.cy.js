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

        // Delete all queue
        cy.get('button.btn.bg-lightPurple1.hover\\:bg-purple.rounded-full')
            .should('be.visible')
            .find('svg.size-6.text-black')
            .click({ force: true })   
        
        // Add queue
        cy.contains('button', 'Add Queue').should('be.visible').click()
        cy.get('#my_modal_3 > div > form > label > input').type('Test1')
        cy.get('#my_modal_3 > div > form > div:nth-child(6) > label > div.flex.items-center > input').click()
        cy.get('#my_modal_3 > div > form > label:nth-child(7) > input').type('T')
        cy.get('#my_modal_3 > div > form > div:nth-child(9) > button').click()
        cy.get('.Toastify__toast-container').contains('Queue Test1 is successfully created.').should('be.visible');
        cy.wait(1000)
        cy.get('.card-title').contains('Test1').should('be.visible');

        // Edit queue
        cy.get('button').find('svg.size-6.text-black').eq(3).click({ force: true });
        cy.get('.grow.font-light').eq(2).clear({ force: true }).type('New', { force: true });
        cy.get('.grow.font-light').eq(3).clear({ force: true }).type('N', { force: true });
        cy.wait(1000)
        cy.contains('button', 'Save').click();
        cy.get('.card-title').contains('Test1New').should('be.visible');

        
        // Delete all queue
        cy.wait(2000)
        cy.get('button.btn.bg-lightPurple1.hover\\:bg-purple.rounded-full')
            .should('be.visible')
            .find('svg.size-6.text-black')
            .click({ force: true })
        

        // Add queue template
        cy.contains('button', 'Queue Template').click();
        cy.contains('button', 'Restaurant').click();

        cy.get('#modal_template > div').scrollTo('bottom');
        cy.contains('button', 'Add Restaurant Template').click();
        
        // Check queue template
        cy.contains('.card-title.text-black', 'Reservation').should('be.visible');
        cy.contains('.card-title.text-black', 'Walk-in').should('be.visible');
        cy.contains('.card-title.text-black', 'Takeaway').should('be.visible');
        cy.contains('.card-title.text-black', 'Delivery').should('be.visible');
        cy.contains('.card-title.text-black', 'Order Pickup').should('be.visible');
        cy.contains('.card-title.text-black', 'Payment').should('be.visible');

    });   
});
  