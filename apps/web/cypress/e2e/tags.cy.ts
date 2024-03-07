import { adminUser } from '@/test/server/stubs';

describe('tags test', () => {
  it('passes', () => {
    cy.login(adminUser.username, adminUser.password);

    cy.addAVisit('testing', 'testpatient');

    //navigate to view instruments, select the first tag available with dropdown
    cy.wait(1000);
    cy.get('button[data-cy="view-instrument"]').first().click({ force: true });
    cy.get('div[data-cy="tags-btn-dropdown"]').click();
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({ force: true });

    //check that a form now contains that selected tag
    let text1: string;
    cy.get('span[class="ui-selected:font-medium"]')
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
    cy.wait(200);
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({ force: true });
    cy.wait(200);
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(1).click({ force: true });

    //check form contains the second tag
    let text2: string;
    cy.get('span[class="ui-selected:font-medium"]')
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

    //deselect the second tag, select the third tag
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({ force: true });
    cy.wait(200);
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(2).click({ force: true });

    //check form contains the third tag
    let text3: string;
    cy.get('span[class="ui-selected:font-medium"]')
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

    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({ force: true });
    cy.wait(200);
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(3).click({ force: true });

    //check form contains the 4th tag
    let text4: string;
    cy.get('span[class="ui-selected:font-medium"]')
      .eq(0)
      .should(($span) => {
        text4 = $span.text();
      });
    cy.get('h5[data-cy="instrument-card"]')
      .eq(0)
      .should(($h5) => {
        const spanText4 = $h5.text();
        expect(spanText4).to.contain(text4);
      });

    //deselect schizo and psychosis from search
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({ force: true });
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(1).click({ force: true });
    cy.wait(200);
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({ force: true });
    cy.wait(200);
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(4).click({ force: true });

    //check form contains the 5th tag
    let text5: string;
    cy.get('span[class="ui-selected:font-medium"]')
      .eq(0)
      .should(($span) => {
        text5 = $span.text();
      });
    cy.get('h5[data-cy="instrument-card"]')
      .eq(0)
      .should(($h5) => {
        const spanText5 = $h5.text();
        expect(spanText5).to.contain(text5);
      });
  });
});
