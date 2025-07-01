@echo off
REM Aguarda o container ficar pronto
echo Waiting for MariaDB to be ready...
:waitDB
docker exec db mariadb -u root -pmariadbrootPW -e "SELECT 1;" >nul 2>&1
IF ERRORLEVEL 1 (
    timeout /t 1 >nul
    GOTO waitDB
)

REM Cria o usuário e concede privilégios
echo Creating user...
docker exec db mariadb -u root -pmariadbrootPW -e ^
"CREATE USER IF NOT EXISTS 'local'@'%%' IDENTIFIED BY '12345678'; ^
 GRANT ALL PRIVILEGES ON *.* TO 'local'@'%%' WITH GRANT OPTION; ^
 FLUSH PRIVILEGES;"

echo User 'local' created with full privileges.