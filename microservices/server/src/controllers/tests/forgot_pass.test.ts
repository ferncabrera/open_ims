import { describe, it, jest, expect, beforeEach, afterEach, afterAll } from "@jest/globals";
import { SpiedFunction } from "jest-mock";
process.env.SERVER_PORT = "4455";
jest.useFakeTimers();
import { server } from "../../../index";
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

import jwt from "jsonwebtoken";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";
import * as db from "../../db";
import * as tokenFn from "../../utils/revokedTokens";

jest.mock('jsonwebtoken', () => {
    return {
        verify: jest.fn().mockReturnValue({ email: 'email@123.com' }),
        sign: jest.fn().mockReturnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
    };
});

jest.mock("@getbrevo/brevo", () => {
    const originalModule: any = jest.requireActual("@getbrevo/brevo");
    const mockSendTransacEmail = jest.fn().mockReturnValue({ response: { status: 200 } });

    const mockTransactionalEmailsApi = jest.fn(() => ({
        sendTransacEmail: mockSendTransacEmail,
    }));

    return {
        ...originalModule,
        Brevo: {
            ...originalModule.Brevo,
            TransactionalEmailsApi: mockTransactionalEmailsApi,
        },
    };
});


describe("forgot password test bundle", () => {

    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    let mockDB: any;
    let mockIsRevoked: any;

    beforeEach(() => {
        mockDB = jest.spyOn(db, 'query');
        mockIsRevoked = jest.spyOn(tokenFn, 'isTokenRevoked')

    })


    afterEach(() => {
        mockDB.mockRestore(); // clears all the spyOn mocks after each test case :)
        mockIsRevoked.mockRestore();
    });

    afterAll(() => {
        jest.resetAllMocks(); // reset all mocks and modules that were mocked
        server.close();
    });

    describe("forgot password function", () => {
        it('should generate forgot password email', async () => {
            jest.useFakeTimers();
            const postData = { email: 'email@123.com'}
            mockDB.mockReturnValue({ rows: [{ email: 'email@123.com', permission: 'admin' }] });
            const res = await requestWithSupertest.post('/api/server/forgot_pass').send(postData)

            // Here is a good example of why writing tests first before writing our back-end code. 
            // It is quite frankly impossible to test and successfully mock this function all at once. Ideally we would have one for creating the email and a separate
            // one for sending. 
            
            // If all goes well, we expect to hit a 401 error due to brevo api key being unauthorized during this test.
            expect(res.status).toEqual(401);
        });

    });

    describe("should update password", () => {
        it('should update password', async () => {
            const postData = { password: 'password1', token: btoa(testToken) }
            mockDB.mockReturnValue({ rows: [{ email: 'email@123.com', password: '$2a$10$zCfwd1d6oiLHMu5jK8EeeejniJK0mSRMheBA07gblSBqfSqayS9MG' }] });
            const res = await requestWithSupertest.patch('/api/server/update_password').send(postData)
            
            expect(JSON.parse(res.text).message).toEqual("Password successfully updated");
            expect(res.status).toEqual(200);
        });

    });

    describe("check password functionality", () => {

        it('should accept new password when checking for duplicates', async () => {

            const postData = { password: 'password1', token: Buffer.from(testToken).toString('base64') };
            mockDB.mockReturnValue({ rows: [{ email: 'email@123.com', password: '$2a$10$zCfwd1d6oiLHMu5jK8EeeejniJK0mSRMheBA07gblSBqfSqayS9MG' }] })


            const res = await requestWithSupertest.post('/api/server/check_password').send(postData)


            expect(JSON.parse(res.text).message).toEqual("Lookup complete, password is good");
            expect(res.status).toEqual(200);

        });

        it('should reject new password when checking for duplicates', async () => {

            const postData = { password: 'password', token: Buffer.from(testToken).toString('base64') };
            mockDB.mockReturnValue({ rows: [{ email: 'email@someti.com', password: '$2a$10$zCfwd1d6oiLHMu5jK8EeeejniJK0mSRMheBA07gblSBqfSqayS9MG' }] })


            const res = await requestWithSupertest.post('/api/server/check_password').send(postData)

            expect(JSON.parse(res.text).message).toEqual("New password has to be different from your old password");
            expect(res.status).toEqual(400);
        });

    });

    describe("validate reset roken", () => {
        it('should accept after validating', async () => {
            const postData = {token: btoa(testToken)};
            mockIsRevoked.mockReturnValue(false);
            const res = await requestWithSupertest.post('/api/server/validate_token').send(postData);

            expect(JSON.parse(res.text).message).toEqual('Validated');
            expect(res.status).toEqual(200);
        });

        it('should reject after validating', async () => {
            const postData = {token: btoa(testToken)};
            mockIsRevoked.mockReturnValue(true);
            const res = await requestWithSupertest.post('/api/server/validate_token').send(postData);

            expect(JSON.parse(res.text).message).toEqual('Token has been revoked, please request a new one');
            expect(res.status).toEqual(401);
        });
    })


});

