describe('Add Entry and run queue', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
  
    before(() => {
      cy.visit(baseURL);
    });
  
    it('Login, add entry and run queue', () => {
        cy.get('body > main > div > div > div > a > button').click();
        cy.wait(1000);

        cy.get('input[name="username"]').type('CpTest');
        cy.wait(1000);

        cy.get('input[name="password"]').type('hackme11');
        cy.wait(1000);

        cy.get(
            'body > div.flex.justify-center.items-center.min-h-screen.bg-cream2 > ' +
            'div > div > form > ' +
            'div.__className_9b0445.text-center.flex.flex-col.justify-center.items-center > ' +
            'button'
          ).click();     
  
        cy.url().should('include', '/business');
        cy.wait(1000);

        cy.get('.select-bordered').should('be.visible')
        cy.get('.select-bordered').select('Walk-in');
        cy.wait(1000);

        cy.contains('button', 'Add').click();
        cy.contains('.card-body p', 'Queue Name: Walk-in').should('be.visible');
        cy.wait(1000);

        cy.get('.select-bordered').should('be.visible').select('Takeaway');
        cy.contains('button', 'Add').click();
        cy.wait(1000);

        cy.contains('button', 'Add').click();
        cy.contains('.card-body p', 'Queue Name: Takeaway').should('be.visible');
        cy.wait(2000);

        cy.get('a[href*="queue-management"]').click();
        

    });

    
  });
  