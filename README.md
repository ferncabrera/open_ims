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
</ul>

To run, lets first make sure that Kubernetes is enabled in the Docker settings. The command ```kubectl get nodes``` should show a single node called ```docker-desktop```.
This application requires your Kubernetes cluster to have the <a href="https://kubernetes.github.io/ingress-nginx/deploy/#quick-start">ingress-nginx</a> controller installed. You can follow the installation steps on the website to get the latest rawYaml or simply run (the version I have):
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```
After it has finished setting up, you are ready to start up the application!

### Development
#### Starting the dev env
In the root of the project, run:
```
skaffold dev
```
<strong>The terminal should now be streaming logs.</strong> Tack on the ```--keep-running-on-failure``` flag to live-debug the app if issues are encountered. The additional flag prevents Docker from caching image artifacts and will prune dangling images created by Skaffold after the environment is torn down (to save memory on your development machine).
<br/>
<br/>
This command will run the application in dev mode. Skaffold will deploy our application and (based on configurations) re-deploy the applications services as it picks up changes to the code. At first, this may take a couple of minutes as images may have to be pulled from <a href="https://hub.docker.com/">Docker Hub</a>, please be patient as Skaffold sets up the environment for the first time.
<br/>
<br/>
Once you start seeing service logs, feel free to make changes (to relevant files) as you usually would and observe the logs Skaffold outputs as it re-builds our application (or in our case specifically, "injects" the changes directly into our running containers). 
#### Stopping the dev env
In the same terminal that was used to run ```skaffold dev```, simply press ```CTRL+C``` to kill the process. Skaffold will take care of the rest and teardown all pods and services/prune any dangling images :D!

