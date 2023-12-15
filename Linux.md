# Linux OS Installation Instructions
![image](https://github.com/ferncabrera/open_ims/assets/77382000/f7497e73-1534-425f-a8e4-f138bcf3220e)

This is a quick guide on how to have this app run in your local development on a Linux, supporting a debian based OS. (Ubuntu, Pop_OS!, etc.)
Following these set of instructions for a different distro stil has potential for it to work.

### Pre-Requisites
- [Docker](https://docs.docker.com/engine/install/debian/) : Follow debian installation instructions
  - You can check if your docker is working by running `sudo systemctl is-active docker`
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/) : Easiest way is to install using binary with curl.
- [minikube](https://minikube.sigs.k8s.io/docs/start/) : Required for starting our k8s cluster.
- [skaffold](https://skaffold.dev/docs/install/) : Skaffold runs our app from our container.

#### Important Note
Because the deployment will write temporary files and will require editing permissions in your root folder (unfortunate circumstance of how this is set up and how vite and node work),
it is important to use "sudo" in your commands otherwise you will not be able to connect to the cluster.
### Set-Up

1. Make sure you have Docker running. `sudo systemctl is-active docker`
   - Start docker `sudo systemctl start docker`
2. Start minikube `sudo minikube start --driver=docker --force` if you are in root, you need to use --force to get it to work.
3. Run `sudo kubectl get nodes` you should see the output below.
   ![image](https://github.com/ferncabrera/open_ims/assets/77382000/7c527d8b-1514-43f5-b363-cb89b351ae85)
4. Now we need to add nginx-ingress as a service to our cluster.
  `sudo kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml`
   Running  `sudo minikube service list` you should see the nginx-ingress services as follows:
   ![image](https://github.com/ferncabrera/open_ims/assets/77382000/9a1af5b8-79f1-4cfc-839f-38c44249af7e)

5. Next we need select ingress-nginx in our minikube cluster. Run `minikube service -n ingress-nginx --url ingress-nginx-controller`
   Refer to [StackOverflow](https://stackoverflow.com/questions/70781384/not-able-access-the-application-running-with-skaffold-and-docker-desktop-on-wsl) for more info.
6. You should get a following response:
   ![image](https://github.com/ferncabrera/open_ims/assets/77382000/d747c70c-fa7c-4faa-807a-78b3ab7b5bb4)
   
   Follow anyone of those links. That is where your app will be hosted on your browser. It should look like this:
   ![image](https://github.com/ferncabrera/open_ims/assets/77382000/f22bce29-54a7-4609-add2-48a0a1b5661a)

8. Finally go into your open_ims directory.
9. In your open_ims directory, run `sudo skaffold dev`
10. Once it compiles without any errors, return back to your browser and voila! You should see the app.

### Shut-down
1. ctrl + c in your terminal and the process will stop. :)
#### If you want to wipe everything and not have the docker processes running in the background
2. `sudo minikube stop`
3. `sudo systemctl stop docker`
After running these two commands (step 2 and 3), you will have to go through the set-up again in its entirety starting from step 1.


### Issues and FAQ:
- minikube failed to start : Exiting due to HOST_JUJU_LOCK_PERMISSION
  - This error is usually caused due to switiching between root and user. Run this command `rm /tmp/juju-*` You should be then able to re-run the start minikube command in step 2.
- What is the URL/IP I need to access to see the app?
  - http://192.168.49.2:31957/ This is the one you want to use! Refresh the page after running skaffold dev. Ensure you followed all set-up steps correctly.
  - Run `sudo kubectl port-forward svc/ingress-nginx-controller 80:80 -n ingress-nginx` this will ensure that the IP you are hosting on will forward the port to localhost:8080
