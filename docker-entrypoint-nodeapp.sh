#!/bin/bash

if [[ ! -f "/db-setup-complete" ]]
then
	# db:create is not required 
	# as mysql startup scipt creates the database
	# apply all pending migrations
	npx sequelize-cli db:migrate

	touch "/db-setup-complete"
fi

# execute remaining commands
exec "$@"

