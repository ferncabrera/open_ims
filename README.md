# open_ims
A custom Inventory Management Solution (IMS) designed and architected specifically for the Christensen Consulting Groups (CCG).

## Development
### Pre-requisites
Our development stack consists of:
<ul>
  <li><a href="https://docs.docker.com/desktop/">Docker Desktop</a> with (ideally):</li>
  <ul>
    <li>Docker Engine v24.0.0 <em>or greater</em></li>
    <li>Kubernetes v1.27.0 <em>or greater</em></li>
  </ul>
  <li><a href="https://skaffold.dev/">Skaffold</a> v2.6.0 </li>
  <li><a href="https://kustomize.io/">Kustomize</a> v5.0.1 (shipped with our version of kubernetes/kubectl) </li>
</ul>

To run, lets first make sure that Kubernetes is enabled in the Docker settings. The command ```kubectl get nodes``` should show a single node called ```docker-desktop```.
This application requires your Kubernetes cluster to have the <a href="https://kubernetes.github.io/ingress-nginx/deploy/#quick-start">ingress-nginx</a> controller installed. You can follow the installation steps on the website to get the latest rawYaml or simply run (the version I have):
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```
After it has finished setting up, you are ready to start up the application!

### Development
#### Starting the dev env
_Confirm that you have the ingress-nginx service running or else application startup will fail!_ If you are not sure whether they are running, you can check by running ```docker container ls``` and you should see an output similar to the image below:

<img width="469" alt="image" src="https://github.com/ferncabrera/open_ims/assets/73137447/a2a8d465-c30a-4f80-a350-d77316209fda">

If you don't see this or are not sure if it is running, just re-run the command in the <a href="https://github.com/ferncabrera/open_ims/blob/main/README.md#pre-requisites">Pre-requisites section</a> used to set up ingress-nginx.

Now that you are ready, in the root of the project, run: 
```
skaffold dev
```
<strong>The terminal should now be streaming logs.</strong> Tack on the ```--keep-running-on-failure``` to prevent Skaffolds default behaviour of exiting on failuire and live-debug the app.
<br/>
<br/>
This command will run the application in dev mode. Skaffold will deploy our application and (based on configurations) re-deploy the applications services as it picks up changes to the code. At first, this may take a couple of minutes as images may have to be pulled from <a href="https://hub.docker.com/">Docker Hub</a>, please be patient as Skaffold sets up the environment for the first time.
<br/>
<br/>
Once you start seeing service logs, feel free to make changes (to relevant files) as you usually would and observe the logs Skaffold outputs as it re-builds our application (or in our case specifically, "injects" the changes directly into our running containers). 
#### Stopping the dev env
In the same terminal that was used to run ```skaffold dev```, simply press ```CTRL+C``` to kill the process. Skaffold will take care of the rest and teardown all pods and services/prune any dangling images :D!

#### Using the database
We use a self-maintained postgres instance built using an official image from the project. The pod containing the running postgres instance itself is maintained by a statefulset exposed to our applications cluster through a headless kubernetes service.
<br/>
<br/>
To interact with the database itself, we can use Docker Desktop. First, run the app using ```skaffold dev``` to startup the application along with the development database. On the Docker Desktop app look for a pod named something similar to **k8s_postgres_dev-postgres-stateful-set-0** (it may have a lot of random letters and nums appended to the end). Click on it and then select the **Terminal** tab.

<img width="444" alt="image" src="https://github.com/ferncabrera/open_ims/assets/73137447/a2b17ae2-5843-4abd-87e2-ed6810a7e53c">

Run ```psql -U dev -d open-ims-dev``` in the terminal to connect to the postgres database running as a part of your app. The _-U_ flag indicates User, and the _-d_ flag indicates the database name. So your local development database uses a user named _dev_ and has the name _open-ims-dev_. If you ever forget, just click on the **Inspect** tab of the Docker Desktop container to view the values set for our Postgres DB.
<br />
<br />
A simple demo showing how we can connect to the database from our express app (server) has been setup at the /serverping route of the app. We use the <a href="https://node-postgres.com/">node-postgres</a> package to connect from our server and execute commands on the DB.

#### Creating and editing tables during development
**Important:**
**Since we are still technically in a development phase across all environments (our data is not important and we don't want to save in on local OR production) the pattern described in this section applies, once we launch the first working production version, the pattern will change accordingly.**
<br/>
<br/>
Start your app (in dev mode!), and then navigate to _common/utils/migration-job/migrations/sql_ directory:

![image](https://github.com/ferncabrera/open_ims/assets/73137447/a6cfa90a-f435-4568-9f14-88777825767b)

You will see two files in this directory (the ones opened in the image above): 
- _open_ims/common/utils/migration-job/migrations/sqls/20230814020356-db-initialization-**down**.sql_
- _open_ims/common/utils/migration-job/migrations/sqls/20230814020356-db-initialization-**up**.sql_

These are RAW SQL files that will be run to initialize/clear the database of the items included in them **THEY BOTH MUST BE UPDATED IN A LOT OF CASES SO PLEASE READ CAREFULLY**. Here is how you can use them to add a new table, for instance:

1. While your app is running, simply paste the SQL command needed to create your table in the ***\*\*UP\*\****.sql file:
   
   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/21c32613-cbbb-4483-a324-17aedb3f18da)

2. You will then notice logs outputting in the terminal where you are running the app:

   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/4ee7b337-4058-444b-8a7b-3edbe145fac1)

   As you can see, there was an error with the SQL command that I added (I'm not even sure what it was lol)! Read the error message for additional information, but for the sake fo this example, we can just comment out the new command and save the file:

   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/c1448a30-dac5-4be0-9cbb-a25c65f3ab71)

   and you will notice how the migration is re-run and the error no longer exists because I commented out the failing command I added.

3. In case you ever see this error:

   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/db600375-1662-4ddd-8808-29def12ea59b)

   It is because we can only have 1 migration-job running at a time, and another was started before the current job could complete. Workaround is to just wait a few seconds and then re-save the file, or delete the job by running ```kubectl delete job dev-migration-job``` and then re-saving again.

5. __Make sure to ALWAYS update the ***\*\*DOWN\*\****.sql file to include the command needed to DROP/DELETE your new item from the database!!!__ Otherwise it won't be deleted everytime the the job runs. An easy way to get the required delete commands is to visit PGAdmin on localhost:30007 and look at the CREATE script for the table/type/etc that you made:

   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/55f9fdf6-dcfd-4282-a03b-5c041885e6dd)

   This will then display a page with the command(s) required to CREATE/DELETE the postgresql resource. The DELETE command you need to add to the ***\*\*DOWN\*\****.sql file can be found commented out here as well:

   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/40931a78-1bcd-4c04-898e-20aea523833c)
   
   See how this command is added to the down.sql file:
   
   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/0a0f4440-381f-4763-b548-fa03c0d429cf)

   IF YOU CHOOSE TO USE THE CREATE SCRIPT IN THE UP.sql MIGRATION FILE **DO NOT INCLUDE THE OWNERSHIP CHANGES OF THE RESOURCES TO THE DEV USER!** The DEV user only exists in DEV and these .sql files will be run in prod as well so we need to make sure they work for both envs. For instance, in the picture below you must make sure to EXCLUDE LINES 21 AND 22 from the UP.sql file!:

   ![image](https://github.com/ferncabrera/open_ims/assets/73137447/c3cb5e18-a7c7-44db-b177-13c9e5987ba1)

#### Connecting to the database using PGAdmin4
We run a <a href="https://www.pgadmin.org/docs/pgadmin4/development/index.html">PGAdmin4</a> instance as a part of our K8s App (please read the docs for more information about what you can do with PGAdmin). You may use it to connect to the local development database running as part of your application, it is available at <a href="http://localhost:30007/">localhost:30007</a> when the app is running. To use this tool simply launch the app as normal, **but note that you may have to wait a minute or two for PGAdmin to set up before you can access it**. It takes some time to start the PGAdmin server so if you try to visit <a href="http://localhost:30007/">localhost:30007</a> it may return a 404 error! You can confirm whether or not PGAdmin is loading by looking at the container logs in Docker Desktop (exactly the same as you do for the actual postgres database except) for a pod named **k8s_pgadmin_dev-pgadmin-0_default_**+RandomNumberAndLetters.

If the container is showing logs like the ones in the image below, it means that it is still loading!

![image](https://github.com/ferncabrera/open_ims/assets/73137447/13d566f2-a92d-4fac-9965-de421f6c23f0)

Wait until you see logs like the ones in the image below (or just a minute or two) to be able to connect from <a href="http://localhost:30007/">localhost:30007</a>.

![image](https://github.com/ferncabrera/open_ims/assets/73137447/eef63ebf-0ee4-4270-8ae4-5d2ec90f392e)

Once the page loads, you will be prompted to enter a PGAdmin email and password. There are default values set (for your local dev environment) which you can use to log in:
<ul>
  <li>Email: **admin@openims.com**</li>
  <li>Password: **pgadmin**</li>
</ul>
Like the postgres container, you can also view the login information required for this container by clicking on the Inspect tab:

![image](https://github.com/ferncabrera/open_ims/assets/73137447/1ff50848-52a4-421f-92bf-eaf9420a6721)

Once you are in, click on the "Servers" dropdown to the left, it should automatically show an **Open IMS Server** which lists the databases in our postgres instance that you can connect to. Click on it and then enter our Postgres password, which is **admin**.

![image](https://github.com/ferncabrera/open_ims/assets/73137447/3ec69e2d-ebc4-4ef8-82b3-d9eceb8ecd5d)

Then, you should be able to select the **open-ims-dev** db to start messing around with it! _(Note that you will find TWO databases under the Open IMS Server list. The database named "postgres" is always created by default and we do not need to use it, just stick to messing with open-ims-dev, the database which our applications server is connected to and using.)_

![image](https://github.com/ferncabrera/open_ims/assets/73137447/3b772f46-1c88-4bdd-9c91-9b04332a3560)

#### Running the production instance of open_ims on your local
There may be instances in which you wish to run the production version of our application on your local machine for debugging purposes (since our production builds differ in some cases, look at the Dockerfiles used in the Skaffold profiles "build" section). We have two different "production" profiles in our Skaffold config, namely __prod-local__ and __prod-do__ for prod deployments on a local env and prod deployments on our digital ocean cluster. The __prod-local__ image is designed so that you can run a **fully functional** version of the production app on local, for example, if you were to run the **prod-do** profile on local, you would notice all of the client calls being redirected to the IP of our ingress-nginx controller running on Digital Ocean. In some cases this behaviour may be intended in case you want to test calls directly against our prod APIs (SSL certs for instance differ when using localhost vs internet IPs). Note that as we begin adding security to our prod service APIs, calls that are made may be blocked due to unauthorization errors etc.
<br/>
<br/>
To start the prod-local instance of Skaffold, first you must ensure that you have a __prod-posgres-credentials__ secret existing on your local K8s cluster. To create this secret using the kubectl CLI use the following command:
```
kubectl create secret generic prod-postgres-credentials --from-literal KEY1=value123 --from-literal KEY2=value123 ...
```
__but make sure to replace the KEY1=value123 and KEY2=value123 with the actual keys required in the secret.__ To check which keys you must define, check the _common/database/kustomize/overlays/dev/postgres-credentials.yaml_ file:

![image](https://github.com/ferncabrera/open_ims/assets/73137447/7124a691-b153-481f-9eed-0f5b891654d1)

Any key-value pairs listed under the stringData section should be included in your CLI command when creating the secret! So in this case, the CLI command to create the secret would be:
```
kubectl create secret generic prod-postgres-credentials --from-literal POSTGRES_USER=prod-local-user --from-literal POSTGRES_PASSWORD=somepass123 --from-literal JWT_SECRET_KEY=someKeyValue123
```
In the case that new keys are added to the postgres-credentials.yaml configuration file, you can delete the old secret by running ```kubectl delete secret prod-postgres-credentials``` and then create a new secret that includes the new key:
```
kubectl create secret generic prod-postgres-credentials --from-literal POSTGRES_USER=prod-local-user --from-literal POSTGRES_PASSWORD=somepass123 --from-literal JWT_SECRET_KEY=someKeyValue123 --from-literal SOME_NEW_KEY=anotherDummySecretValue
```
Confirm that the secret exists by running ```kubectl describe secrets```, you should see an output listing your _prod-postgres-credentials_ secret with the corresponding key-value pairs that were defined for it (see below).

![image](https://github.com/ferncabrera/open_ims/assets/73137447/8c1906bd-6537-4f88-a061-8144e639d899)

Once your secret has been created, you can simply run ```skaffold run -p prod-local --tail``` in the root of the open_ims project to startup the prod-local instance. You should see the services starting up in a similar way they do when Skaffold is run in _dev_ mode, but you will notice that there is not hot-reloading when editing files. The _skaffold run_ command will only build and run the images _once_ using the production configurations (which exclude Vite hot-replacements and nodemon restarts on file changes). __For this reason it is important you understand that the production instance should be run for debugging only and NOT for local development purposes__.
<br/>
<br/>
To stop tailing the logs, enter ```ctrl+c``` to kill that process, __you then must MANUALLY instruct Skaffold to DELETE the kubectl resources it created as part of the prod-local app deployment to stop the app!__ To do this, run:
```
skaffold delete -p prod-local
```
Skaffold will then output the names of the services it stopped in the CLI. Confirm that all of the services have stopped by checking your running container in Docker Desktop. __The steps for running the prod-do profile are IDENTICAL, just use the prod-do profile instead of prod-local when running the CLI command listed in the steps above!__

