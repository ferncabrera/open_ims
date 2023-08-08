import { Pool, QueryResult } from 'pg';

export const pool = new Pool();


export const query = async (text: string, params?: (any)[]) => {
        const start = Date.now()
        const res = await pool.query(text, params)
        const duration = Date.now() - start
        console.log('Query details below:\n', { text, execTimeInMS: duration, rowsInQuery: res.rowCount })
        return res;
};

// !!! NOT TESTED - Ripped from the docs, so this may need debugging once we start working with transactions....

export const getClient = async () => {
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
};
