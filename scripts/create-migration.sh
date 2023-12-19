#! /bin/bash

echo "Enter a name for this migration:"

read migration_name

echo "Creating new migration: $migration_name! (Building the image first... one second)"

docker image build -t fcabrera01/create-migration-helper:latest -f ./common/utils/migration-job/Dockerfile.migrations --build-arg USER_ID=$(id -u) \
  --build-arg GROUP_ID=$(id -g) ./common/utils/migration-job

echo "Creating your migration now!"

docker container run --rm -it --mount type=bind,source="$(pwd)"/common/utils/migration-job,target=/home/node/app/migration-job \
  --user "$(id -u):$(id -g)" \
  --workdir /home/node/app/migration-job \
  fcabrera01/create-migration-helper:latest db-migrate create $migration_name --sql-file

# chown -R hostuser:hostuser ./common/utils/migration-job

echo "All done! :)"