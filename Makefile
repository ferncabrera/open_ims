SHELL := /bin/bash

define HELP

${GREEN_BOLD}Master Makefile${END}

 Available commands:

	- dev: Start the OPEN_MS application in DEV mode! (Happy coding :D)
	
	- prod: Start the OPEN_MS application in PROD mode! (Happy debugging :D)
		
	- ms-image-clean: Remove all open-ims development images from your machine... (Starting the application after may take longer as images will need to build)
	
	- pgadmin: Open PGAdmin UI on browser (http://localhost:30007) user: admin@openims.com pass: admin


	${ORANGE_BOLD}- TODO:${END}
		Update Secret/Config Map propogation method (Look into something like https://github.com/stakater/Reloader to ensure pods restart after secret updates)
			At the moment we need to restart the application after secret updates. We should make this manual.
			- reload-configs: Re-create configmap
			- reload-secrets: Re-create secrets
			- reload-all: Recreate secrets and configmap

	- test: Command to run to execute tests on local development environment 
	- logs: Display logs for all running service (Is this possible with Skaffold and not having to re-create the services?)

endef

export HELP

export CYAN=\x1b[96m
export CYAN_BOLD=\x1b[1;96m
export PURPLE_BOLD=\x1b[1;95m
export BLUE=\x1b[94m
export BLUE_BOLD=\x1b[1;94m
export ORANGE=\x1b[93m
export ORANGE_BOLD=\x1b[1;93m
export GREEN=\x1b[92m
export GREEN_BOLD=\x1b[1;92m
export RED=\x1b[91m
export RED_BOLD=\x1b[1;91m
export END=\e[m

help:
	@echo -e "$$HELP"
.PHONY: help

dev:
	# explorer.exe "http://localhost" & 
	./start.sh dev
.PHONY: dev

pgadmin:
	explorer.exe "http://localhost:30007" & 
.PHONY: pgadmin

prod:
	./start.sh prod
.PHONY: prod

ms-image-clean:
	@echo "Cleaning any open-ims server and client images!"
	docker rmi -f $$(docker images fcabrera01/open-ims-client-dev)
	docker rmi -f $$(docker images fcabrera01/open-ims-server-dev)
	@echo "Pruned whatever we could!"
.PHONY: ms-image-clean

clean:
	skaffold delete ; skaffold delete -p prod-local ; skaffold delete -p dev
.PHONY: clean
