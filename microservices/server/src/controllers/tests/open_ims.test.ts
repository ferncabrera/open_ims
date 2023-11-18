// open_ims.test.ts
import { it, expect } from "@jest/globals";

// const server = require('../index.js');
import {server} from "../../../index";
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

it("Health Check Running", async () => {
    
    const res = await requestWithSupertest.get('/api/server/open_ims');
    
    expect(res.text).toEqual('Health Check Successful, API services are running');
});
