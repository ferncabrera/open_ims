import React from "react";
import { expect, describe, it } from 'vitest';
import renderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router";
import { RecoilRoot } from "recoil";
import { Login } from "../Login";

function tree() {
    return render(<MemoryRouter><RecoilRoot><Login /></RecoilRoot></MemoryRouter>)
}



describe("Login Component", () => {

    // This first test case takes a snapshot. Compares and makes sure no previous styles or html changes were made from its last snapshot.
    it("Login renders correctly", () => {
        const tree = renderer.create(<MemoryRouter><RecoilRoot><Login /></RecoilRoot></MemoryRouter>).toJSON();
        expect(tree).toMatchSnapshot();

    });

    //Unit Test Cases for components

    it("Test reset password modal functionality", () => {
        // Here is an example of a DOM test. Ensuring that certain html and operations on what the user sees is functional and is expected.
        const { getByText, queryByText } = tree();

        expect(queryByText("Send email")).not.toBeInTheDocument(); // modal should not be open!
        fireEvent.click(getByText("forgot password")); // we click forgot password
        expect(getByText("Send email")).toBeInTheDocument(); // we check to see if the modal displays
        expect(queryByText("Email Sent!")).not.toBeInTheDocument(); // This should not show until we sent the email
        fireEvent.click(getByText("Send email")); // send email
        expect(queryByText("Send email")).not.toBeInTheDocument(); // modal screen should have changed!
        expect(getByText("Email Sent!")).toBeInTheDocument(); // Our final modal screen

    });

    it("Test validation function", () => {
        // Here we test the functionality of validations as a user fills out the form
        const { getByText, getByLabelText } = tree();
        const emailInput = getByLabelText("Email:");
        const passwordInput = getByLabelText("Password:")

        fireEvent.change(emailInput, { target: { value: "" } });
        fireEvent.blur(emailInput);


        expect(getByText("Required")).toBeInTheDocument();

        fireEvent.change(emailInput, { target: { value: "invalid-email" } });
        fireEvent.blur(emailInput);

        expect(getByText("Please enter a valid email")).toBeInTheDocument();

        fireEvent.change(passwordInput, { target: { value: "" } });
        fireEvent.blur(passwordInput);


        expect(getByText("Required")).toBeInTheDocument();

    });

    it("Test handle sign in", async () => {
        const { getByLabelText, getByText, queryByTestId } = tree();
        const emailInput = getByLabelText("Email:");
        const passwordInput = getByLabelText("Password:");
        const signInButton = getByText("Sign in");

        const testInputCases = [
            { email: "", password: "" },
            { email: "", password: "hello123" },
            { email: "oliver", password: "hello123" },
            { email: "oliver@gamil.com", password: "" },
            { email: "oliver@gmail.com", password: "hello123" }
        ];

        const testCases = [
            { emailV: "Required", passwordV: "Required" },
            { emailV: "Required", passwordV: "" },
            { emailV: "Please enter a valid email", passwordV: "" },
            { emailV: "", passwordV: "Required" },
            { emailV: "", passwordV: "" }
        ];

        for (let i = 0; i < testCases.length; i += 1) {
            fireEvent.change(emailInput, { target: { value: testInputCases[i].email } });
            fireEvent.change(passwordInput, { target: { value: testInputCases[i].password } });
            fireEvent.click(signInButton);

            if (testCases[i].emailV) {
                expect(queryByTestId("email-error")).toBeInTheDocument();
            } else {
                expect(queryByTestId("email-error")).not.toBeInTheDocument();
            }

            if (testCases[i].passwordV) {
                expect(queryByTestId("password-error")).toBeInTheDocument();
            } else {
                expect(queryByTestId("password-error")).not.toBeInTheDocument();
            }
        }

        //check if a cookie is created from our mock apiCall
        await new Promise((resolve) => setTimeout(resolve, 100)); // Allow asynchronous actions to create cookie

        expect(document.cookie).toContain('is-authenticated=true'); // Check if the cookie is present in document.cookie


    });


})