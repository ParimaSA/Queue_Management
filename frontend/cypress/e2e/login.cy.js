describe('Add Entry and run queue', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
    let ticket;
  
    before(() => {
      cy.visit(baseURL);
    });
  
    it('Login, add entry and run queue', () => {
        // Login with incorrect username and password
        cy.login('CpTest1234', 'hackme1234');
        cy.get('div.Toastify__toast.Toastify__toast--error', { timeout: 10000 })
            .should('be.visible')
            .and('contain.text', 'Login failed');

        
        // Login with correct username and password
        cy.login('CpTest', 'hackme11');

        cy.url().should('include', '/business');

        // Check important elements
        cy.get('h1.card-title.text-bold.mt-3.text-black', { timeout: 5000 })
            .should('be.visible')
            .and('contain.text', 'Add Entry');

        cy.get('h2.text-black')
            .should('be.visible')
            .and('contain.text', 'All Queue');

        cy.get('select.select-bordered')
            .should('be.visible')
            .and('have.class', 'select-bordered');
        
        // Queue template button
        cy.get('button.btn.bg-lightPurple8')
            .should('be.visible')
            .and('have.class', 'bg-lightPurple8')
            .and('contain.text', 'Queue Template');
        
        // Add queue button
        cy.get('button.btn.bg-lightPurple8.hover\\:bg-purple.text-black')
            .should('be.visible')
            .and('contain.text', 'Add Queue');

        // Delete all queues button
        cy.get('button.btn.bg-lightPurple1.hover\\:bg-purple.rounded-full')
            .should('be.visible')
            .find('svg.size-6.text-black')
            .should('exist');
        
        // Dropdown
        cy.get('select.select-bordered')
            .should('be.visible')
            .and('have.class', 'select-bordered')

        // Add Button
        cy.get('button.btn.h-\\[8vh\\].lg\\:w-full.sm\\:w-full.bg-white.text-black')
            .should('be.visible')
            .and('contain.text', 'Add');
            
    });   
});
  