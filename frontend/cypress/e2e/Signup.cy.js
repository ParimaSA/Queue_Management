describe('Signup', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/business/login';
    const uniqueUsername = 'CyTest' + Math.random().toString().slice(2, 12);
    const businessName = 'CyBusiness' + Math.random().toString().slice(2, 12);
  
    before(() => {
      cy.visit(baseURL);
    });

    it('Sign Up and Login Flow', () => {
        // Navigate to Sign-Up page
        cy.contains('a', 'Sign up').click();
        cy.wait(1000)
    
        // Ensure the page is fully loaded
        cy.get('input[placeholder="Username"]').should('be.visible');
    
        // Fill the sign-up form
        cy.get('input[placeholder="Username"]').type(uniqueUsername);
        cy.get('input[placeholder="Business Name"]').type(businessName);
        cy.get('#password1').type('hackme11'); // Password
        cy.get('#password2').type('hackme11'); // Confirm Password
    
        // Submit the form
        cy.contains('button', 'Sign up').click();
    
        // Verify redirection to login page
        cy.url().should('include', `${baseURL}`);
    
        // Login with new credentials
        cy.login(uniqueUsername, 'hackme11')
    
        // Navigate to Profile page
        cy.contains('summary', 'Account').click();
        cy.contains('a', 'Profile').click();
    
        // Verify correct business name
        cy.contains(businessName).should('be.visible');
    });
  });
   