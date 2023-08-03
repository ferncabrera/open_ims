import { Client, Pool } from 'pg';
import { QueryResult } from 'pg';

const pool = new Pool();

export const seed = async (): Promise<void> => {
    try {
        console.log("Creating exampletable....");
        await query('CREATE TABLE IF NOT EXISTS exampletable (nums integer UNIQUE)');

        console.log("Inserting num1 if not exists...");
        await query('INSERT INTO exampletable(nums) VALUES($1)', [1]);

    } catch (error) {
        console.log("Error seeding your database! See it below");
        console.log(error)
    }
};


export const query = async (text: string, params?: (any)[]) => {
    try {
        const start = Date.now()
        const res = await pool.query(text, params)
        const duration = Date.now() - start
        console.log('Query details below:\n', { text, execTimeInMS: duration, rowsInQuery: res.rowCount })
        return res;
    } catch (err) {
        console.log("Oh no - There was an error executing your query, please see below:");
        console.log({ text, err });
    }
};

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

// export const query = (text, params) => pool.query(text, params);