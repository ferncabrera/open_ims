#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
CYAN="\x1b[96m"
CYAN_BOLD="\x1b[1;96m"
PURPLE_BOLD="\x1b[1;95m"
BLUE="\x1b[94m"
BLUE_BOLD="\x1b[1;94m"
GREEN="\x1b[92m"
GREEN_BOLD="\x1b[1;92m"
RED="\x1b[91m"
RED_BOLD="\x1b[1;91m"
END="\e[m"
SCRIPT_NAME=$(basename "$0")

handle_error() {
    echo -e $RED_BOLD"\nFATAL ERROR: "$END"OPEN IMS has failed to start!!! There was an "$CYAN"issue executing line $1"$END", cleaning up any created resources..."
    skaffold delete -p $MODE && echo -e "\nAll "$CYAN_BOLD$MODE$END" services deleted!"
    echo -e "\n"$BLUE$SCRIPT_NAME$END$RED_BOLD" FAILED!"$END"\n"
    exit 1
}

trap 'handle_error $LINENO' ERR

if [ $# -eq 0 ]
  then
    #? If no arguments were used to start the script, assume DEV profile configuration.
    MODE="dev"
  else 
    #? Otherwise use the profile passed as first arg (we should only be starting prod-local profile with this script)
    MODE=$1
    if [[ $MODE == *"prod"* ]]
      then
        MODE="prod-local"
    fi
fi

echo -e "\nStarting the open_IMS in "$CYAN_BOLD$MODE$END" mode!\n"

echo -e $PURPLE_BOLD"Step 1:"$END" Create "$BLUE"open-ims-config-map"$END" (contains env vars) and "$BLUE"open-ims-secrets"$END" objects for "$CYAN_BOLD$MODE$END" deployment!"

$SCRIPT_DIR/scripts/create-secrets-and-config-map.sh $MODE

echo -e $PURPLE_BOLD"Step 1 "$END$GREEN_BOLD"Completed successfully!\n"$END

echo -e $PURPLE_BOLD"Step 2:"$END" Run skaffold "$CYAN_BOLD$MODE$END$BLUE" profile!\n"


if [ "$MODE" = "dev" ]
  then
    skaffold dev
  else 
    trap 'echo -e "\ncleaning up now...\n" && skaffold delete -p $MODE && echo -e "\nall "$CYAN_BOLD$MODE$END" services deleted!"' SIGINT
    skaffold run -p $MODE --tail 
fi

echo -e "\n"$BLUE$SCRIPT_NAME$END" completed"$GREEN_BOLD" SUCCESSFULLY"$END"\n"