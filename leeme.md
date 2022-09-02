# Usar table plus , docker y wsl
  lo primordial es instalar docker, configurar el docker-compose
  luego mientras ejecutamos el docker en el terminal de ubuntu
  para saber que puerto tenemos que usar para conectarnos a la BD
  es
  
    ```  
      hostname -I
    ```

  con el ip listo, debemos insertarlo en nuestro host 
  para asi realizar la conexion



#No olvidar como conectarse a cockroach

seguir el mismo formato para el connectionstring 
pero en la database debmos agregar el nombre del cluster
y luego el nombre de la database 
por ejemplo en el proyecto cockroach actual
el clustr es bony-crawler-284 y la BD es defaultdb
porlo que en el Database ira : bony-crawler-284.defaultdb
