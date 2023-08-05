import { Client, Pool } from 'pg';
import { QueryResult } from 'pg';
import { query } from './queries';

export const pool = new Pool();

export const seed = async (): Promise<void> => {
    try {
        console.log("Creating exampletable...");
        await query('CREATE TABLE IF NOT EXISTS exampletable (nums integer UNIQUE)');

        console.log("Inserting num1 if not exists...");
        await query('INSERT INTO exampletable(nums) VALUES($1)', [1]);

    } catch (error) {
        console.log("Error seeding your database! See it below");
        console.log(error)
    }
};