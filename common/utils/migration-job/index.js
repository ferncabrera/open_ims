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

// first require the package
const DBMigrate = require('db-migrate');

// The next step is to get a new instance of DBMigrate
console.log("attempting to connect to instance!");
const dbmigrate = DBMigrate.getInstance(true);
const log = console.log;

// next we call the migrations, several examples in a promise style


module.exports.init = function () {
    dbmigrate.reset()
        .then((test) => {
            // log(`TEST${JSON.stringify(test)}TEST`);
            log('\x1b[92mYour database has been successfully reset!!!!\x1b[0m');
            log('\x1b[92m(This is expected, please see below for the migration attempt logs)\x1b[0m');
        })
        .then(() => {

            dbmigrate.up()
                .then((test) => {
                    // log(`TEST${JSON.stringify(test)}TEST`);
                    log(`
\x1b[92m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0      
    
\x1b[92mYAY!!!!!\x1b[0m
\x1b[92mYour migrations have been successfully applied to the database!\x1b[0m
            
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
                    console.log("\x1b[92m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0");
                    console.log("Process ended successfully, exiting with CODE 0");
                    process.exit(0);
                })
                .catch(err => {
                    if (err.toString().includes('prod-postgres-stateful-set-0.prod-postgres-headless-service') || err.toString().includes('dev-postgres-stateful-set-0.dev-postgres-headless-service')) {
                        console.log("Not a valid SQL err, retrying the job!");
                        console.log("Process FAILED, exiting with ERR CODE 1");
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
                      console.log("\x1b[91m-------------------------------------------------------------------------------------------------------------------------------------------------------\x1b[0");
                    });
                    
                })
                .catch(err => log(`ERR Reseting the database!!!! This is an unusual error, please lmk if you see this!!!!!!!!!!!!!!!! -> ${err}`));
                
            };
            
            module.exports.create = function () {
                dbmigrate.create(process.env.MIGRATION_NAME)
                .then(() => {
                    log('All migrations completed!\n');
                    console.log("Process ended successfully, exiting with CODE 0");
                    process.exit(0);
                });
            };
            