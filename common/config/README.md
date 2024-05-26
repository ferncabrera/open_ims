# Managing secrets and environment variables

## How it works
As part of the applications startup, a script is run that will use the configuration files in this directory to create a Kuberentes Secret & ConfigMap. Both of these objects are required to exist on the cluster where the app is run, otherwise the services will be missing key variables and fail to start/run correctly. 

## Environment variables
Environment variables that are added to either the _./common/config/**dev**/.env_ or  the _./common/config/**prod**/.env_ files will be automatically available to all K8s services as their keyname (after restarting the app) _except for the client service!_

For example, if you were to change the .env file in the _dev_ config from:
```env
POSTGRES_DB=open-ims-dev
PGPORT=5432
PGHOST=dev-postgres-stateful-set-0.dev-postgres-headless-service
SERVER_PORT=3000
```
to:
```env
POSTGRES_DB=open-ims-dev
PGPORT=5432
PGHOST=dev-postgres-stateful-set-0.dev-postgres-headless-service
SERVER_PORT=3000
A_NEW_ENV_VAR=some_valid_123_value
```
Then you would be able to access the process.env.A_NEW_ENV_VAR property in the _server_ microservice after restarting the application (CTRL+C to kill and then ./start.sh again)!

Make sure to add the required environment variable to the PROD .env file as well after testing in DEV!

## Secrets
Secrets should only be used to store sensitive information that cannot be public. For this reason the .secrets.env files are not committed to the repository.
Instead, there exists a _.secrets.template.env_ file in the ./commmon/config directory that contains an **up to date** list of all secrets currently required for our application to run with DUMMY VALUES.
When first starting the app, if these files are not found, then a new one will be created using the secrets.template.env file with its fake values, the app will still run but it may just not function as expected (you will see this warning in the logs when starting the app).
You should replace the DUMMY secret values with some real ones if you would like to have the app working 100%.

Secrets that are added to either the _./common/config/**dev**/.secrets.env_ or  the _./common/config/**prod**/.secrets.env_ files will be automatically available to all K8s services as their keyname  (after restarting the app) _except for the client service!_

It follows the same logic as the env variable example from before^ where secret would be available to the server as process.env.NEW_SECRET_NAME

Make sure to add any new secrets to the PROD .secrets.env file **as well as the .secrets.template.env file** after testing in DEV so that others know what sort of secrets they must configure to run the application!
