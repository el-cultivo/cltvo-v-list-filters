# cltvo-v-list-filters

## Dependencias
Para reducir el tamaño del paquete compilado en dist hay ciertas dependencias que no se incluyen pero que se espera que existan en la carpeta de `node_modules`:

Otras versiones distintas a las especificadas posiblemente puedan funcionar sin ningú problema.

```
"dependencies": {
  "coral-std-library": "1.1.3",
  "lodash.debounce": "4.0.8",
  "ramda": "0.24.1",
  "vue": "1.0.28"
}
```  



## Uso
Exporta un mixin `listFilters` y tres funciones helpers `isPath, isPathInObjArray, isStringArray`.

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

## Tipos de los filtros

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

