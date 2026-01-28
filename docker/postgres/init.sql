CREATE DATABASE "elearn-backend-service";
CREATE DATABASE "elearn-user-service";

GRANT ALL PRIVILEGES ON DATABASE "elearn-backend-service" TO app_user;
GRANT ALL PRIVILEGES ON DATABASE "elearn-user-service" TO app_user;