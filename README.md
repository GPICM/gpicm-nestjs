  
  
### Grant Local mysql permission:

```
docker exec -it db mariadb -u root -p
```

password:
```
 mariadbrootPW
```

```
CREATE USER 'local'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON *.* TO 'local'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

