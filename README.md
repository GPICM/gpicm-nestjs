  
  
  Grant mysql permission
  
docker exec -it db mariadb -u root -p

```
CREATE USER 'local'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON *.* TO 'local'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

