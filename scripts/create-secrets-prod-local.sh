#!/bin/bash

echo "Creating server secrets for your prod-local/prod-do deployment of open_IMS!" 

echo -e "\x1b[96mMake sure that you have created a .server.secrets.env file in the ./microservices/server/kustomize/overlays/dev directory BEFORE running this script!!!\n\n\x1b[0m"

{ # try

    kubectl delete secret prod-postgres-credentials
    kubectl create secret generic prod-postgres-credentials \
    --from-literal=POSTGRES_USER='prod' \
    --from-literal=POSTGRES_PASSWORD='admin' &&
    echo -e "\x1b[92m\nprod-postgres-credentials secret created successfully\n\x1b[0m"

    kubectl delete secret server-secrets    
    kubectl create secret generic server-secrets --from-env-file=./microservices/server/kustomize/overlays/dev/.server.secrets.env &&
    echo -e "\x1b[92m\nserver-secrets secret created successfully\x1b[0m"
    #save your output
    echo -e "\x1b[92m\nSUCCESS!!!!! Happy prod-ding :D\x1b[0m"
} || { # catch
    # save log for exception 
    echo -e "\x1b[91mOOPS!!!! ERROR ENCOUNTERED: Looks like one of the kubectl commands used to create your prod secrets failed...\x1b[0m"

    echo -e "\x1b[96mPlease double check that you have created a .server.secrets.env file in the ./microservices/server/kustomize/overlays/dev directory BEFORE running this script!\x1b[0m"

    echo "Error!" 1>&2
    exit 64
}

echo -e "\nexiting."