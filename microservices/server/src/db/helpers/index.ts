import { pool } from "..";
import { QueryResult } from "pg";

export const clientCheck = (): number => {
    return pool.idleCount;
};

export const getClient = async () => {
    try {
        const client = await pool.connect()
        const query = client.query
        const release = client.release
        // set a timeout of 5 seconds, after which we will log this client's last query
        // monkey patch the query method to keep track of the last query executed
        const timeout = setTimeout(() => {
            console.error('A client has been checked out for more than 5 seconds!')
            console.error(`The last executed query on this client was: ${(client as any).lastQuery}`)
        }, 5000)
        client.query = (...args: any) => {
            (client as any).lastQuery = args
            return query.apply(client, args) as unknown as Promise<QueryResult>;
        }
        client.release = () => {
            // clear our timeout
            clearTimeout(timeout)
            // set the methods back to their old un-monkey-patched version
            client.query = query
            client.release = release
            return release.apply(client)
        }
        return client
    } catch (error) {
        console.log("Error occured during getClient function execution, see below:");
        console.log(error);
    }
};