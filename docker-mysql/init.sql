DROP USER IF EXISTS 'root'@'%';

-- creating new user; % allows client using any host can login as this user
-- this is a security issue, i need to restrict the hosts. since i am only allowing
-- node-auth-app to connect to this mysql db, therefore i must use the container host name of node-auth-app
-- which is the container name i.e. node-auth-app. but i can not figure out why there is connection error when
-- i use node-auth-app as host
--
-- FORMAT: CREATE USER 'username'@'host' IDENTIFIED BY 'password';
-- NOTE: if i change username and password here then i also have to change the DB_URL in production .env
CREATE USER 'root'@'%' IDENTIFIED BY 'root';

-- creating the database, no need to create db by sequelize
CREATE DATABASE `db_node_authentication_with_email_verification`;

-- granting all privileges to user root from any host for all tables of database db_node_authentication_with_email_verification
GRANT ALL PRIVILEGES ON `db_node_authentication_with_email_verification`.* TO 'root'@'%' WITH GRANT OPTION;

-- applying new privileges
FLUSH PRIVILEGES;
