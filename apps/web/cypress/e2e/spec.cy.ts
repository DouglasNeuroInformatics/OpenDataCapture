//make sure to change these credentials based on the profiles within the database
const username = 'david'
const password = 'Password123'


describe('login test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    cy.url().should('include','overview')
    cy.get('span[data-cy="view-subjects"]').first().click({force: true})

  })
})

describe('tags test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    //navigate to view instruments, select the first tag available with dropdown
    cy.get('span[data-cy="view-instrument"]').first().click({force: true})
    cy.get('div[data-cy="tags"]').click()
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({force: true})
    

    //check that a form now contains that selected tag
    let text1: string;
    cy.get('span[class="ui-selected:font-medium"]').eq(0).should(($span) => {
       text1 = $span.text()
    })
    cy.get('h5[data-cy="instrument-card"]').eq(0).should(($h5) =>
    {
      const spanText1 = $h5.text();
      expect(spanText1).to.contain(text1);
    })

    //deselect the first tag, select the second tag
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(0).click({force: true})
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(1).click({force: true})

    //check form contains the second tag
    let text2: string;
    cy.get('span[class="ui-selected:font-medium"]').eq(1).should(($span) => {
       text2 = $span.text()
    })
    cy.get('h5[data-cy="instrument-card"]').eq(0).should(($h5) =>
    {
      const spanText2= $h5.text();
      expect(spanText2).to.contain(text2);
    })


    //deselect the second tag, select the third tag
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(1).click({force: true})
    cy.get('li[id*="headlessui-listbox-option-:"]').eq(2).click({force: true})
   
    //check form contains the third tag
    let text3: string;
    cy.get('span[class="ui-selected:font-medium"]').eq(2).should(($span) => {
       text3 = $span.text()
    })
    cy.get('h5[data-cy="instrument-card"]').eq(0).should(($h5) =>
    {
      const spanText3 = $h5.text();
      expect(spanText3).to.contain(text3);
    })
    


  })
})


describe('Graph test', () => {
  it('passes', () => {
    
    cy.login(username, password)
    
    //navigates the view sujects, selects the first subject and views their graph
    cy.get('span[data-cy="view-subjects"]').first().click({force: true})
    cy.get('td').first().click()
    cy.get('a[data-cy="graph"]').first().click()
    cy.get('div[data-cy="instrument-select"]').contains('Instrument').click()
    cy.get('button[id*="headlessui-menu-item-:"]').first().click()

    cy.get('div[data-cy="measure-select"]').contains('Measures').click()
    cy.get('li[id*="headlessui-listbox-option-:"]').first().click()


  })
})