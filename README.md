# Polls

## Описание

Микросервис голосования. Создает, редактирует, отдает опросы.

## Установка

#### Конфигурация докер контейнера

Создать в корне проекта файл .env с содержимым:

```
SERVER_HOST=localhost
SERVER_PORT=4000
NODE_ENV=dev

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=pass
DB_DATABASE=polls
TYPEORM_SYNC=true
```

- **_SERVER_HOST_** - адрес web-сервера
- **_SERVER_PORT_** - порт web-сервера
- **_NODE_ENV_** - режим запуска node.js
  > dev/prod
- **_DB_HOST_** - адрес базы данных
- **_DB_PORT_** - порт базы данных
- **_DB_USERNAME_** - пользователь базы данных для подключения
- **_DB_PASSWORD_** - пароль пользователя для подключения
- **_DB_DATABASE_** - имя базы
- **_TYPEORM_SYNC_** - синхронизация typeOrm (необходима при создании новой базы)

#### Запуск и пересборка докер контейнера

```
docker-compose up --build
```
> используй флаг `-V`, если нужно очистить volumes при запуске

Остановка проекта:
```
docker-compose down
```
> используй флаг `-v` если нужно очистить volumes при остановке

Сервис доступен по адресу: <http://localhost:SERVER_PORT>
> SERVER_PORT - порт, который указали в файле .env

## Запуск тестов

Unit-тесты написаны на Jest.

Запуск:
```npm run test```

В режиме разработки:
```npm run test:watch```

С выводом покрытия тестами:
```npm run test:cov```
