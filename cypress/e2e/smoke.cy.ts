import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  it("should allow user to search crypto", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };
    cy.visitAndCheck("/");

    cy.get("#search").type("polkadot");
    cy.get("tr").should("have.length", 3);
    cy.get("tr").eq(0).click();
    cy.get("a")
      .eq(1)
      .should("have.attr", "href", "/login")
      .should("have.text", "Login to Save");
    cy.get("a").eq(1).click();
    cy.findByRole("link", { name: /Sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.get("#search").type("polkadot");
    cy.get("tr").should("have.length", 3);
    cy.get("tr").eq(0).click();
    cy.get("#save-button").click();
    cy.get("#save-status")
      .should("have.length", 1)
      .should("have.text", "⭐️")
      .click();

    cy.get("#unsave_button").click();
    cy.get("#save-status").should("have.length", 0);
  });
});
