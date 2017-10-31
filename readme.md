# cltvo-v-list-filters

## Dependencias
Para reducir el tamaño del paquete compilado en dist hay ciertas dependencias que no se incluyen pero que se espera que existan en la carpeta de `node_modules`:

Otras versiones distintas a las especificadas posiblemente puedan funcionar sin ningún problema.

```
"dependencies": {
  "coral-std-library": "1.1.3",
  "lodash.debounce": "4.0.8",
  "ramda": "0.23.0",
  "vue": "1.0.28"
}
``` 

## Uso
Exporta un mixin `listFilters` y tres funciones helpers `isPath, isPathInObjArray, isStringArray`.

El mixin agrega dos propiedad importantes al componente: `filtered_list` y `filter_by`.

#### filtered_list
Es la lista que se imprime

#### filter_by
Es un string que debe corresponder al nombre de la propiedad que contiene las funciones de filtrado. En el ejemplo de abajo, en `data.filters` este string puede ser `name`,  `state`,  `name_or_state` o `''`.  Cuando el estado de esta propiedad cambia, entonces se activa un filtro distinto, dependiendo del string que contenga.  (El string vacío no implica ningún filtro.)

#### data.filters
Es un objeto que contiene objetos con los distintos filtros.  Es necesario que cada objeto contenido aquí tenga un array llamado `filters` que contenga una serie de funciones, todas ellas deben tener el siguiente tipo `String -> {*} -> Boolean`. Cuando hay más de una función en este array, los resultados del proceso de filtrado se agregan.

### Ejemplo
```
import {listFilters, isPath, isPathInObjArray} from 'cltvo-v-list-filters'

export const buddiesTable = simpleCrud('#buddies-table-template',{
  mixins: [listFilters],
  data: {
    filters:{
      name: {
        description: 'Nombre',
        filters: [isPath(['full_name'])]
      },
      state: {
        description: 'Entidad Federativa',
        filters: [isPath(['state', 'official_name'])]
      },
     name_or_state: {
        description: 'Buscar por Nombre o Entidad Federativa',
        filters: [
          isPath(['full_name']),
          isPathInObjArray(['states'], ['official_name'])
        ]
      }
    }
  }
});

```

## Tipos de los filtros que vienen por default

```
FilterBy :: nombre | email | etc.
FilterType
=  isPath (ejectuado por la funcion objTextFilter) 
| isPathInObjArray  (ejectuado por la funcion objArrayTextFilter )
| isStringArray (ejectuado por la funcion stringArrayTextFilter)

```
### Cómo hacer otros filtros

Crear una función que al pasarse al array filters, reciba un String y un Objeto y devuelva un Booleano. El objeto que recibe la función será uno de los objetos de la lista.

`String search -> ListObj {*}  -> Boolean`

### Si se necesita modificar la lista antes de filtrarla

Agregar al componente que recibe el mixin el siguiente método
```
// preMapper :: [{*}] -> [{*}]
preMapper(){
  return this.list.map(/*lo que se quiera hacer*/)
}
```

