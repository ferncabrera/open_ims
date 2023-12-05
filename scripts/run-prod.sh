#!/bin/bash

echo "Running the PROD-LOCAL version of this app... all resources will be built using as many production resources as possible! Use this to debug prod-only issues :D!" 

{ # try
    cd "$(dirname "$0")"

    echo -e "\nCreate necessary secrets!"
    
    bash ./scripts/create-secrets-prod-local.sh

    echo -e "\x1b[92m\nSUCCESS!\x1b[0m"
    echo -e "\nTrying to run the app now."

    trap "echo cleaning up now... && skaffold delete -p prod-local && echo all services deleted!" SIGINT

    skaffold run -p prod-local --tail 


} || { # catch
    # save log for exception 
    echo -e "\x1b[91mOOPS!!!! ERROR ENCOUNTERED... please try to debug this - otherwise reach out for help!\x1b[0m"
}

echo -e "\nexiting script now."