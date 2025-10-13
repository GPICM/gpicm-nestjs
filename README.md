  
  
### Grant Local mysql permission:
Objetivo:
Criar um usuário chamado local no banco de dados MySQL/MariaDB rodando em um container, com permissões completas de acesso.

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

ou simplesmente rode:

```
yarn run db:local
```


### Apos instalar dependencias novas Rodar: 

Objetivo:
Garantir que o ambiente de containers reflita corretamente as novas dependências instaladas (sejam bibliotecas, pacotes ou configurações).

```
docker compose down -v
```

- Encerra os containers definidos no docker-compose.yml.

- Remove os volumes associados, garantindo que não haja dados antigos armazenados.

```
docker compose up --build
```

- Reconstrói as imagens com base nas mudanças feitas (como novas dependências).

- Inicia os containers com a nova configuração atualizada.



## Problemas em fazer upload de imagem

```
chmod 777 -R public/assets
```
