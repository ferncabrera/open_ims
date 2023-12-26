#!/bin/bash

#! THIS SCRIPT IS USED FOR MANUALLY DEPLOYING NEW SECRETS AT THE MOMENT BE CAREFUL IF EDITING!!!

#! ****INFO*****:
#? This script will create the Kubernetes secret and config-map objects that the open_IMS services require 
#? using the .env and .secrets.env files that can be found in ../common/config/ prod or dev directories.

#! ****USAGE****:
#? Simply call the script with 
# `./scripts/create-secrets-and-config-map.sh skaffoldProfileName` 
#? Where Skaffold profile name is either dev, prod-local, or prod-do depending on the env that you want to run!

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
CYAN="\x1b[96m"
BLUE="\x1b[94m"
BLUE_BOLD="\x1b[1;94m"
GREEN="\x1b[92m"
GREEN_BOLD="\x1b[1;92m"
RED="\x1b[91m"
RED_BOLD="\x1b[1;91m"
END="\e[m"
SCRIPT_NAME=$(basename "$0")

if [ $# -eq 0 ]
  then
    #? If no arguments were used to start the script, assume DEV secrets.
    MODE="dev"
    ENV_MODE=$MODE
  else 
    #? If it is a prod profile we should just point to the prod directory and trim off the -local or -do tags
    MODE=$1
    if [[ $MODE == *"prod"* ]]
      then
        ENV_MODE="prod"
      else
        ENV_MODE=$MODE
    fi
fi

echo -e $BLUE$SCRIPT_NAME$END" has been started!\n"

echo -e $BLUE_BOLD"\nIMPORTANT NOTICE:"$END" Secrets used in the application during development are created by referencing the .secrets.env file found in your $SCRIPT_DIR/../common/config/$ENV_MODE directory."
echo -e "   If this file is not found while starting the application (using the start.bat script, not skaffold dev/prod-local) it *should* create one for you and copy the contents found inside of the $PWD/../common/config/.secrets.template.env file."
echo -e "   Make sure that you "$BLUE"MODIFY (or create) the .secrets.env FILE IN ./common/config/$ENV_MODE directory BEFORE running the application if you would like to use real secret values while devving!"$END
echo -e "   If you wish"$BLUE" to update the secret values YOU MUST STOP THE APPLICATION COMPLETELY, update the values, and then start it again... "$END$RED"because secrets cannot be updated while the application is running!"$END"\n"


if [ -f $SCRIPT_DIR/../common/config/$ENV_MODE/.secrets.env ]; then
    if cmp -s "$SCRIPT_DIR/../common/config/$ENV_MODE/.secrets.env" "$SCRIPT_DIR/../common/config/.secrets.template.env"; then
        echo -e $RED_BOLD"WARN: "$END' a .secrets.env file was found but it appears to be idential to the template file provided. '$RED"The application may not function as expected without real secrets!"$END
    else
        echo -e $GREEN_BOLD"SUCCESS:"$END' a unique .secrets.env file was found!'
    fi
else
    echo -e $RED_BOLD"WARN: "$END' No .secrets.env file was found! Creating one for you using the .template.secrets file. '$RED"The application may not function as expected without real secrets!"$END
    cp -p -n $SCRIPT_DIR/../common/config/.secrets.template.env $SCRIPT_DIR/../common/config/dev/.secrets.env
fi

echo -e "\nRemoving any (old) existing config objects are deleted before creating new ones (avoiding updates!)"
kubectl delete secret $ENV_MODE-open-ims-secrets
kubectl delete configmap $ENV_MODE-open-ims-config-map 

echo -e "\nAttempting to create the $CYAN$ENV_MODE$END$BLUE-open-ims-secrets$END and $CYAN$ENV_MODE$END$BLUE-open-ims-config-map$END objects:\n"


{ # try
    #? Create the open-ims-secret object for the env the app is being launched in
    kubectl create secret generic $ENV_MODE-open-ims-secrets --from-env-file=$SCRIPT_DIR/../common/config/$ENV_MODE/.secrets.env && \
    echo -e $GREEN_BOLD"   SUCCESS: "$END$CYAN$ENV_MODE$END"-open-ims-secrets created!\n" && \

    #? Create the open-ims-config-map object for the env the app is being launched in
    kubectl create configmap $ENV_MODE-open-ims-config-map --from-env-file=$SCRIPT_DIR/../common/config/$ENV_MODE/.env && \
    echo -e $GREEN_BOLD"   SUCCESS: "$END$CYAN$ENV_MODE$END"-open-ims-config-map created!" && \
    
    #? Cool it all worked! We should be ready to launch the app....

    echo -e $GREEN_BOLD"\nSUCCESS:"$END" All the necessary configuration objects have been created in your Kuberenetes cluster, you can start the app now!"
} || { # catch
    # save log for exception 
    echo -e $RED_BOLD"\nFATAL ERROR: "$END"There was a problem creating the necessary open_IMS configuration object in your cluster..."
    echo -e "You may debug using the ERR information provided above, but otherwise reach out for support!"
    echo -e $BLUE"\nCleaning up any created resources..."$END

    (kubectl delete secret $ENV_MODE-open-ims-secrets ; kubectl delete secret $ENV_MODE-open-ims-config-map)

    echo -e "\n"$BLUE$SCRIPT_NAME$END$RED_BOLD" FAILED!"$END"\n"
    exit 1
}

echo -e "\n"$BLUE$SCRIPT_NAME$END" completed"$GREEN_BOLD" SUCCESSFULLY"$END"\n"