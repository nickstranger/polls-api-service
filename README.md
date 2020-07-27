# Polls

## Описание

Проект сервиса голосования.

Проект основан на фреймворке Nestjs

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Зависимости

Перечень зависимостей приложения

## Структура приложения

Описание папок и файлов приложения

## Установка

### Конфигурация докер контейнера

1. Для управления режимом докер контейнера необходимо установить переменную NODE_ENV
   в переменных средах
   По умолчанию, режим development

Для режима разработки:

```
export NODE_ENV=development
```

Для режима рабочей версии:

```
export NODE_ENV=production
```

2. Создать файл .env с содержимым:

```
.env
```

Заполните поля (пример):

```
SERVER_PORT=3000
SERVER_HOSTNAME=localhost
DB_HOSTNAME=postgres
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=pass
DB_DATABASE_NAME=polls
MODE=dev
TYPEORM_SYNC=true
REDIS_HOSTNAME=redis
REDIS_PORT=6379
```

**_SERVER_PORT_** - порт web сервера, который сконфигурирован в фреймворке
**_SERVER_HOSTNAME_** - имя web сервера
**_DB_HOSTNAME_** - адрес базы данных
**_DB_PORT_** - порт базы данных
**_DB_USERNAME_** - пользователь базы данных для подключения
**_DB_PASSWORD_** - пароль пользователя для подключения
**_DB_DATABASE_NAME_** - имя базы
**_MODE_** - режим запуска nodejs
dev - режим разработки
prod - режим рабочей версии
debug - режим отладки
**_TYPEORM_SYNC_** - синхронизация typeOrm необходима при создании новой базы
**_REDIS_HOSTNAME_** - адрес сервиса кешиования
**_REDIS_PORT_** - порт сервиса кеширования

##№ Запуск и сборка контейнера докер

```
docker-compose up
```

##№ Пересборка контейнера докер

Просто пересборка проекта

```
docker-compose up
```

С очисткой всех хранилищ

```
docker-compose up --build -V
```

Сервер доступен по адресу: <http://localhost:SERVER_PORT>
SERVER_PORT - порт, который указали в файле .env

##№ Запуск тестов
Описание запуска тестов
