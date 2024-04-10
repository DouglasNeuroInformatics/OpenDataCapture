import { adminUser } from '@/test/server/stubs';

describe('tags test', () => {
  it('passes', () => {
    cy.login(adminUser.username, adminUser.password);
    cy.addVisit('Jane', 'Doe');

    // navigate to view instruments, select the first tag available with dropdown
    cy.get('button[data-cy="view-instrument"]').first().click();
    cy.get('div[data-cy="tags-btn-dropdown"]').click();
    cy.get('li[data-cy="select-dropdown-option"]').eq(0).click();

    // check that a form now contains that selected tag
    let text1: string;
    cy.get('span[data-cy="select-dropdown-option-label"]')
      .eq(0)
      .should(($span) => {
        text1 = $span.text();
      });
    cy.get('h5[data-cy="instrument-card"]')
      .eq(0)
      .should(($h5) => {
        const spanText1 = $h5.text();
        expect(spanText1).to.contain(text1);
      });

    //deselect the first tag
    cy.get('li[data-cy="select-dropdown-option"]').eq(0).click();
    cy.get('li[data-cy="select-dropdown-option"]', { timeout: 10000 }).eq(1).should('be.visible');
    cy.get('li[data-cy="select-dropdown-option"]').eq(1).click();

    // check form contains the second tag
    let text2: string;
    cy.get('span[data-cy="select-dropdown-option-label"]')
      .eq(1)
      .should(($span) => {
        text2 = $span.text();
      });
    cy.get('h5[data-cy="instrument-card"]')
      .eq(0)
      .should(($h5) => {
        const spanText2 = $h5.text();
        expect(spanText2).to.contain(text2);
      });

    // deselect the second tag, select the third tag
    cy.get('li[data-cy="select-dropdown-option"]').eq(0).click();
    cy.get('li[data-cy="select-dropdown-option"]', { timeout: 10000 }).eq(2).should('be.visible');
    cy.get('li[data-cy="select-dropdown-option"]').eq(2).click();

    // check form contains the third tag
    let text3: string;
    cy.get('span[data-cy="select-dropdown-option-label"]')
      .eq(0)
      .should(($span) => {
        text3 = $span.text();
      });
    cy.get('h5[data-cy="instrument-card"]')
      .eq(0)
      .should(($h5) => {
        const spanText3 = $h5.text();
        expect(spanText3).to.contain(text3);
      });
  });
});
