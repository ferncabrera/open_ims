import { rest } from "msw";

let HOST: string | undefined;

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_HOST_DEV;
} else {
    HOST = import.meta.env.VITE_HOST_PROD;
}

const baseURL = `http://${HOST}`;

// Add all your handlers (mock api functions) here please.

export const handlers = [
    
    //defined login mock-api, testing mock cookie creating and if front-end can detect it
    //this function is primarily defined so that any running apis don't fail our test cases
    rest.post(`${baseURL}/api/server/login`, async (req, res, ctx) => {
        const {email, password} = await req.json()
        console.log(email, password)
        if (email === 'oliver@gmail.com' && password === 'hello123') {
            sessionStorage.setItem('is-authenticated', 'true');
            console.log(sessionStorage);
            return (res((ctx.status(200)), ctx.cookie('is-authenticated', 'true'), ctx.json({ message: 'Authorized' })));
        } else {

            return (res(ctx.status(401), ctx.json({ message: 'Un-Authorized User' })))
        }
    }),
    rest.post(`${baseURL}/api/server/forgot_pass`, async (req, res, ctx) => {
        const body = await req.json()
        console.log("body sent (empty email for now) --> ", JSON.stringify(body));
            return (res((ctx.status(200)), ctx.json({ message: 'Success' })));
            // return (res(ctx.status(401), ctx.json({ message: 'Un-Authorized User' })))
        
    }),
]