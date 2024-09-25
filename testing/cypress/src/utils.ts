export const createDownloadsFolder = () => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.task('mkdir', downloadsFolder);
};

export const deleteDownloadsFolder = () => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.task('rmdir', downloadsFolder);
};
