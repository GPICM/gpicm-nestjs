#!/bin/bash

echo "Waiting for MariaDB to be ready..."
until docker exec db mariadb -u root -pmariadbrootPW -e "SELECT 1;" &> /dev/null; do
  sleep 1
done

echo "Creating user..."
docker exec db mariadb -u root -pmariadbrootPW -e "
CREATE USER IF NOT EXISTS 'local'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON *.* TO 'local'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"

echo "User 'local' created with full privileges."
