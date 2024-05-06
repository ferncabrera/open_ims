SHELL := /bin/bash

define HELP

${GREEN_BOLD}Master Makefile${END}

 Available commands:

	- dev: Start the OPEN_MS application in DEV mode! (Happy coding :D)

	- test: Command to run to execute tests on local development environment 


	${ORANGE_BOLD}- TODO:${END}
		Update Secret/Config Map propogation method (Look into something like https://github.com/stakater/Reloader to ensure pods restart after secret updates)
			At the moment we need to restart the application after secret updates. We should make this manual.
			- reload-configs: Re-create configmap
			- reload-secrets: Re-create secrets
			- reload-all: Recreate secrets and configmap

	- logs: Display logs for all running service (Is this possible with Skaffold and not having to re-create the services?)

endef

export HELP

export SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
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
	sh start.sh dev
.PHONY: dev

prod:
	explorer.exe "https://github.com/ferncabrera/open_ims?tab=readme-ov-file#running-the-production-instance-of-open_ims-on-your-local" &
	sh start.sh prod
.PHONY: prod

# logs:
# 	docker-compose logs --follow
# .PHONY: logs

clean:
	skaffold delete ; skaffold delete -p prod-local ; skaffold delete -p dev
.PHONY: clean

# start:

# .PHONY 