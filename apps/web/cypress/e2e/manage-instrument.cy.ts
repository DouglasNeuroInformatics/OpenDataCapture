// //make sure to change these credentials based on the profiles within the database
import { adminUser } from '@/test/server/stubs';

describe('Subject view test', () => {
    it('passes', () => {
  
      cy.login(adminUser.username, adminUser.password);
  
      //navigates the view sujects, selects the first subject and views their graph
      cy.get('button[data-cy="manage-instrument"]').first().click({force: true});

  
  
    })
  })