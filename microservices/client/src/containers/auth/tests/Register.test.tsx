import React from "react";
import { expect, describe, it } from 'vitest';
import renderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router";
import { Register } from "../Register";
import { RecoilRoot } from "recoil";

function tree() {
    return render(<MemoryRouter><RecoilRoot><Register /></RecoilRoot></MemoryRouter>)
}

describe("Register Component", () => {

    it("Register renders correctly", () => {
        const tree = renderer.create(<MemoryRouter><RecoilRoot><Register /></RecoilRoot></MemoryRouter>).toJSON();
        expect(tree).toMatchSnapshot();

    });

    it("Test validation function", () => {
        const { getByLabelText, queryByTestId } = tree();
        const firstNameInput = getByLabelText("First Name:");
        const lastNameInput = getByLabelText("Last Name:");
        const emailInput = getByLabelText("Email:");
        const passwordInput = getByLabelText("Password:");

        const errorIDs = ["firstName-error", "lastName-error", "email-error", "password-error"];
        const allInputs = [firstNameInput, lastNameInput, emailInput, passwordInput];

        for (let i = 0; i < allInputs.length; i += 1) {
            fireEvent.change(allInputs[i], { target: { value: "" } });
            fireEvent.blur(allInputs[i]);
            expect(queryByTestId(errorIDs[i])).toBeInTheDocument();
        }

        const tooLongPassword = "H3C%nn1"
        const invalidPasswords = ['H3C%nn1', tooLongPassword.repeat(15), 'h3c%nn11', "HeC%nnll", "H3C%NN11", "H3C1NN11"];

        for (let i = 0; i < invalidPasswords.length; i += 1) {
            fireEvent.change(allInputs[3], {target: {value: invalidPasswords[i]}});
            fireEvent.blur(allInputs[3]);
            expect(queryByTestId(errorIDs[3])).toBeInTheDocument();
        }

        const validValues = ["fernando", "gibson", "fernandoscores0@email.com", "Pa$$wOrd123"];

        for (let i= 0; i < validValues.length; i += 1) {
            fireEvent.change(allInputs[i], {target: {value: validValues[i]}});
            fireEvent.blur(allInputs[i]);
            expect(queryByTestId(errorIDs[i])).not.toBeInTheDocument();
        }




    });
})