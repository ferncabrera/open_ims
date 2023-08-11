import { query } from "."

const initializeDatabaseSchema = async() => {

    // user_table
    // await query('CREATE TABLE IF NOT EXISTS exampletable (nums integer UNIQUE)');

    await query(`CREATE TABLE IF NOT EXISTS user_table (
        id SERIAL PRIMARY KEY,
        email VARCHAR(50) UNIQUE,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        permission VARCHAR(50),
        password VARCHAR(128)
    )`);

    // please add any other tables here that we need to initialize
};

export default initializeDatabaseSchema;