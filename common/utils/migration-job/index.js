/**
  * This project should give an insight in how a project might utilize the
  * programable API.
  *
  * This assumes we have a simple web project, which should initialize the
  * database by itself. There are further examples on how to control and use the
  * API in the cli project. This is the straightforward usage of db-migrate.
  *
  * You may also find a better integrated version of this with custom configs
  * and other supported features in the server.js example.
  */

const pg = require('pg');
const pool = new pg.Pool();    

// first require the package
const DBMigrate = require('db-migrate');

// some misc helper stuff for logging purposes
const CYAN="\x1b[96m";
const CYAN_BOLD="\x1b[1;96m";
const BLUE="\x1b[94m";
const BLUE_BOLD="\x1b[1;94m";
const GREEN="\x1b[92m";
const GREEN_BOLD="\x1b[1;92m";
const RED="\x1b[91m";
const RED_BOLD="\x1b[1;91m";
const END="\x1b[0m";
const JOB_ID = process.env.JOB_ID;

// The next step is to get a new instance of DBMigrate
console.log(`${CYAN_BOLD + JOB_ID + END} is attempting to connect to the DB!`);
const dbmigrate = DBMigrate.getInstance(true);
const log = console.log;

// next we call the migrations, several examples in a promise style

const createDummyMigration = async function () {
    try {
        const res = await pool.query("SELECT * FROM public.migrations");
        if(res.rowCount == 0)
        await pool.query(`INSERT INTO public.migrations(
            id, name, run_on)
            VALUES (5, '/20230814020356-db-initialization', '2023-08-20 22:36:00.294');`);
        
        console.log(`\x1b[96mSuccessfully created dummy migration, your down.sql file should run as expected :) (fix the err and continue devving!)\x1b[0`);
    } catch (error) {
        console.log(`\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0`);
        console.log(`\x1b[91mThere was an error running the migration-seed function!! This is unusual and means that your DB resets/down functionality won't work properly... please let me know if you encounter this issue!!!\n\n${error}\x1b[0`);
        console.log(`\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0`);
    }
    await pool.end();
}

module.exports.init = function () {
    dbmigrate.down('20230814020356-db-initialization-down')
        .then((test) => {
            // log(`TEST${JSON.stringify(test)}TEST`);
            log('\x1b[92mYour database has been successfully reset!!!!\x1b[0m');
            log('\x1b[92m(This is expected, please see below for the migration attempt logs)\x1b[0m');
        })
        .then(() => {

            dbmigrate.up()
                .then(async (test) => {
                    // log(`TEST${JSON.stringify(test)}TEST`);
                    log(`
\x1b[92m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0      
    
\x1b[92mYAY!!!!!\x1b[0m
\x1b[92mYour UP/DOWN migrations have BOTH been successfully applied to the database!\x1b[0m
            
  \x1b[96mQUICK NOTE:\x1b[0m
    
  \x1b[96mPLEASE MAKE SURE TO WAIT ANOTHER 5 SECONDS AFTER SEEING THIS MESSAGE BEFORE YOU SAVE SOME MORE CHANGES!\x1b[0m
  \x1b[96mThere can only ever be one migration job running at a time and everytime you save a change, a migration-job runs!\x1b[0
  \x1b[96mif you accidentally save before the currently-running job finishes you may get a weird long error that start like the one below:\x1b[0m
                
    \x1b[31m  -> The Job "migration-job" is invalid: spec.template: Invalid value: core.PodTemplateSpec{ObjectMeta:v1.ObjectMeta{Name:"", GenerateName:"", Namespace:..\x1b[0m
                    
  \x1b[96mDon't worry, if this happens to you - either:\x1b[0
    \x1b[96m- Open another terminal and run 'kubectl delete job migration-job', then just save the file again and it should work ;)\x1b[0m
    \x1b[96m- Or just kill Skaffold (CTRL+C), and then re-run it :)\x1b[0m
        
\x1b[92mHappy migrating!!!!!!\x1b[0m
            `);
                    console.log(`\x1b[92m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0`);
                    console.log(`\n${GREEN_BOLD + JOB_ID +END} completed successfully, exiting with CODE 0\n`);
                    // await createDummyMigration();
                    process.exit(0);
                })
                .catch(async (err) => {
                    if (err.toString().includes('prod-postgres-stateful-set-0.prod-postgres-headless-service') || err.toString().includes('dev-postgres-stateful-set-0.dev-postgres-headless-service')) {
                        console.log(`\n${RED_BOLD + JOB_ID + END} failed to connect to the DB!, re-trying migration.... exiting with ERR CODE 1\n`);
                        // console.log(`Process FAILED, exiting with ERR CODE 1`);
                        process.exit(1);
                    }
                    log(`
\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0      
                        
\x1b[91mOOPS!!!!! \x1b[0m
\x1b[91mTHERE WAS AN ERROR RUNNING YOUR MIGRATION!!! But don't worry this is all OK :)\x1b[0m
                                
\x1b[96mThis just means that your database has no tables in it at the moment, the RESET was successful, but the creation of your tables wasn't unfortunately...\x1b[0m
\x1b[96mThe whole app is still running though, so you may experience issues if you try to continue using the app while the database has no tables!\x1b[0m
                                        
\x1b[96mYou will need to fix the .sql file you were working on and save your changes to try migrating the tables again, READ BELOW TO SEE HOW TO FIX:\x1b[0m
                                            
  \x1b[96mQUICK NOTE:\x1b[0m
                                                
  \x1b[96mPLEASE MAKE SURE TO WAIT ANOTHER 5 SECONDS AFTER SEEING THIS MESSAGE BEFORE YOU SAVE SOME MORE CHANGES/FIXES!\x1b[0m
  \x1b[96mThere can only ever be one migration job running at a time and everytime you save a change, a migration-job runs!\x1b[0
  \x1b[96mif you accidentally save before the currently-running job finishes you may get a weird long error that start like the one below:\x1b[0m
    
    \x1b[31m  -> The Job "migration-job" is invalid: spec.template: Invalid value: core.PodTemplateSpec{ObjectMeta:v1.ObjectMeta{Name:"", GenerateName:"", Namespace:..\x1b[0m
    
  \x1b[96mDon't worry, if this happens to you - either:\x1b[0
    \x1b[96m- Open another terminal and run 'kubectl delete job migration-job', then just save the file again and it should work ;)\x1b[0m
    \x1b[96m- Or just kill Skaffold (CTRL+C), and then re-run it :)\x1b[0m
                
\x1b[91mTHE SQL ERROR IN THE FILE THAT YOU NEED TO FIX (FIX THIS AND THEN SAVE!):\x1b[0m
                    
-> \x1b[91m${err}\x1b[0
                        `);
                      console.log(`\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0`);
                      await createDummyMigration();
                    });
                    
                })
                .catch(err => log(`
\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0

\x1b[91mOOPS - There was an error re-setting the database!!\x1b[0

This means that \x1b[91mthere was an error running your down.sql file (The one containing all of the DROP commands)! It will be displayed below, just like in the up.sql file, make sure to fix it and then save:)\x1b[0
    
\x1b[96mTIP: Make sure to read the error carefully, it could be caused because you re-named tables that now exist and were not deleted properly. Look at the object in PGAdmin to see what is currently in your DB!\x1b[0

\x1b[91mError in the file:\x1b[0
                
  ->\x1b[91m ${err}\x1b[0


    
\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0
    `));
                
            };
            
            module.exports.create = function () {
                dbmigrate.create(process.env.MIGRATION_NAME)
                .then(() => {
                    log('All migrations completed!\n');
                    console.log(`Process ended successfully, exiting with CODE 0`);
                    process.exit(0);
                });
            };
            