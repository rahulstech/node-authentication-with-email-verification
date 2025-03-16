#!/bin/sh

MARKER="/docker-setup.1"

# Run the Sequelize migration
if [[ ! -f $MARKER ]]
then

    yes | npx sequelize-cli db:migrate

    touch $MARKER
fi

exec "$@"
