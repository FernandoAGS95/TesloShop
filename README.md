# Variables de entorno
  - docker-compose up -d (para levatnar la imagen local de docker)
  - Lo anterior era para cargar la imagen
  - Para trabajar con variables de entorno debemos instalar @nestjs/config
  - yarn add @nestjs/config

  - Luego de instalar, tenemos que agregar en n:w
  uestro app.module dentro de los imports el ConfigModule.forRoot()

  - luego de configurar en nuestro app.module la importacion del configmodule nos toca instalar
  las dependencias de typeorm en este caso para trabajar con postgres
  - yarn add @nestjs/typeorm pg




## TYPEORM
Intalar typeorm para postgres
  - yarn install --save @nestjs/typeorm typeorm pg


# Instruccfiones gfenerales

  1. Clonar repositorio
  2. yarn install
  3. Clonar el archivo  .env.template y renombrar a  .env
  4. cambiar las variables de entorno
  5. levantar la BDD con docker-compose-up
  6. levantar el servidor con yarn run start:dev

