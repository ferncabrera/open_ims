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

If you don't see this or are not sure if it is running, just re-run the command in the *Pre-requisites* section used to set up ingress-nginx.

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

#### Connecting to the database using PGAdmin4
We run a <a href="https://www.pgadmin.org/docs/pgadmin4/development/index.html">PGAdmin4</a> instance as a part of our K8s App (please read the docs for more information about what you can do with PGAdmin). You may use it to connect to the local development database running as part of your application, it is available at <a href="http://localhost:30007/">localhost:30007</a> when the app is running. To use this tool simply launch the app as normal, **but note that you may have to wait a minute or two for PGAdmin to set up before you can access it**. It takes some time to start the PgAdmin4 server so if you try to visit <a href="http://localhost:30007/">localhost:30007</a> it may return a 404 error! You can confirm wether or not PGAdmin4 is loading by looking at the container logs in Docker Desktop (exactly the same as you do for the actual postgres database except) for a pod named **k8s_pgadmin_dev-pgadmin-0_default_**+RandomNumberAndLetters.

If the container is showing logs like the ones in the image below, it means that it is still loading!

![image](https://github.com/ferncabrera/open_ims/assets/73137447/13d566f2-a92d-4fac-9965-de421f6c23f0)

Wait until you see logs like the ones in the image below (or just a minute or two) to be able to connect from <a href="http://localhost:30007/">localhost:30007</a>.

![image](https://github.com/ferncabrera/open_ims/assets/73137447/eef63ebf-0ee4-4270-8ae4-5d2ec90f392e)

Once the page loads, you will be prompted to enter a PGAdmin email and password. There are default values set for you which you can use to log in:
<ul>
  <li>Email: **admin@openims.com**</li>
  <li>Password: **pgadmin**</li>
</ul>
Like the postgres container, you can also view the login information required for this container by clicking on the Inspect tab:

![image](https://github.com/ferncabrera/open_ims/assets/73137447/1ff50848-52a4-421f-92bf-eaf9420a6721)

Once you are in, click on the "Servers" dropdown, it should automatically show your **open-ims-db** a DB that you can connect to. Click on it and then enter the PostgresDB password, which is **admin**.

![image](https://github.com/ferncabrera/open_ims/assets/73137447/3ec69e2d-ebc4-4ef8-82b3-d9eceb8ecd5d)

Then, you should be able to select the **open-ims-dev"" db to start messing around with it!

![image](https://github.com/ferncabrera/open_ims/assets/73137447/3b772f46-1c88-4bdd-9c91-9b04332a3560)

