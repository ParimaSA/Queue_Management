describe('Signup', () => {
    const baseURL = 'https://queue-management-taupe.vercel.app/';
    const uniqueUsername = 'CyTest' + Math.random().toString().slice(2, 12);
    const businessName = 'CyBusiness' + Math.random().toString().slice(2, 12);
  
    before(() => {
      cy.visit(baseURL);
    });

    it('Sign Up and Login Flow', () => {
      // Navigate to Sign-Up page
      cy.contains('button', 'Start Now').click();
      cy.contains('a', 'Sign up').click();
  
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
      cy.url().should('include', `${baseURL}business/login`);
  
      // Login with new credentials
      cy.get('input[placeholder="Username"]').type(uniqueUsername);
      cy.get('input[placeholder="Password"]').type('hackme11');
      cy.contains('button', 'Login').click();
  
      // Navigate to Profile page
      cy.contains('summary', 'Account').click();
      cy.contains('a', 'Profile').click();
  
      // Verify correct business name
      cy.contains(businessName).should('be.visible');
    });
  });
  
  