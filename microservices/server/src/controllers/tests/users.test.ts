import {Request, Response} from "express";
import { describe, it, jest, expect, beforeEach, afterEach, afterAll } from "@jest/globals";

import * as db from "../../db";
import { server } from "../../../index";
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

jest.mock('jsonwebtoken', () => {
    return {
        verify: jest.fn().mockReturnValue({ email: 'email@123.com' }),
        sign: jest.fn().mockReturnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
    };
});

describe("User related tests", () => {

    let mockDB: any;

    const PASSWORD = "$2a$10$6Ck5DKSSLAGKBlXX9mvzjOYH3KORymmWTrh9IDMbcv1.O9NZZxuCa";

    beforeEach(() => {
        mockDB = jest.spyOn(db, 'query');

    });

    afterEach(() => {
        mockDB.mockRestore();
    });

    afterAll(() => {
        jest.resetAllMocks(); // reset all mocks and modules that were mocked
    });


    it('Should register the user', async () => {
        const registerData = {firstName: 'John', lastName: 'Smith', email: 'email@123.com', newPassword: 'Password123'}
        mockDB.mockReturnValue('success');

        const res = await requestWithSupertest.post("/api/server/register").send(registerData);

        expect(JSON.parse(res.text).message).toEqual('registration successful!');
    });

    it('Should login the user', async () => {
        const loginData = {email: 'email@123.com', password: 'Password123'}
        mockDB.mockReturnValue({rows:[{email: 'email@123.com', first_name:'John', last_name: 'Smith', password: PASSWORD }]});

        const res = await requestWithSupertest.post("/api/server/login").send(loginData);

        expect(JSON.parse(res.text).message).toEqual("Success");

    });

    it('Should receive invalid credentials the user', async () => {
        const loginData = {email: 'email@123.com', password: 'WrongPassword'}
        mockDB.mockReturnValue({rows:[{email: 'email@123.com', first_name:'John', last_name: 'Smith', password: PASSWORD }]});

        const res = await requestWithSupertest.post("/api/server/login").send(loginData);

        expect(JSON.parse(res.text).message).toEqual("Email or Password is incorrect");

    });
});
