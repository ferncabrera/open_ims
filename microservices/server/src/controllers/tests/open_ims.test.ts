// open_ims.test.ts
import { it, expect, jest } from "@jest/globals";

// const server = require('../index.js');
process.env.SERVER_PORT = "4455";
jest.useFakeTimers();
import {server} from "../../../index";
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

it("Health Check Running", async () => {
    
    const res = await requestWithSupertest.get('/api/server/open_ims');
    
    expect(res.text).toEqual('Health Check Successful, API services are running');

    server.close();

});
