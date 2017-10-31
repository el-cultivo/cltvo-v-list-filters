const R = require('ramda')
import debounce from 'lodash.debounce'
import {multiTextFilter2, pathHasString, stringInPathOfObjArray, substringInStringArray} from 'coral-std-library'

/**
 * Mixin: listFilter
 * 
 * V 1.1.2
 * 
 * Para información sobre los tipos descritos aquí, revisar readme.md
 * @type {Object}
 */


// isPath :: Path [string] -> String search -> Boolean
export const isPath = pathHasString

// isPathInObjArray :: Path [String path_to_array]  -> Path [String path_to_text] -> String search -> Boolean
export const isPathInObjArray = stringInPathOfObjArray

// isStringArray :: Path [String]  -> String search -> Boolean
export const isStringArray = substringInStringArray

//Como hacer otros filtros
//Crear una función que al pasarse al array filters, reciba un String y un Objeto y devuelva un Objeto
//  String search -> {*}  -> Boolean
//  
export const listFilters = {
    data() {
        return {
            // list: [],//definir en el componenten o si se usa en una instancia Root de Vue
            filters: {},// type FilterSpec, to be defined on receiver component
            filter_by: '',// type FilterBy,
            previous_filter: '',
            search: '',
            previous_search: '',
            filtered_list: [],
            memorized_filters: {}//tenemos que generar el key del array usando todos los parametros de la busqueda para poder diferenciar las otras posibilidades, por ahora son filter_by y search, por lo tanto nuesto objeto se debe ver así
                //{
                //  filter_by_${this.filter_by}$search_${this.search} : []
                //}
        }
    },


    computed: {
        pre_mapped_list() {
             if(typeof this.preMapper === 'function') {
                return this.preMapper(this.list)
             }
            return this.list
        },
    },

    ready() {
        this.filterList()
    },

    methods: {
        filterList: debounce(function() {
            let filters = R.path([this.filter_by, 'filters'], this.filters)
            //Optimización: memoización
            let filtered_list = R.pathOr([], ['memorized_filters', `filter_by_${this.filter_by}$search_${this.search}`], this)

            if (filtered_list.length !== 0) {
                this.filtered_list = filtered_list
                return
            }
            
            if (filters !== undefined && this.search !== '' &&  this.search.length >= 2) {
                
                //Optimización: usando previous_search y previous_filter
                let list =  this.pre_mapped_list
                if (this.search.indexOf(this.previous_search) === 0 && this.previous_search !== '' && this.previous_filter === this.filter_by) {//si la busqueda es un refinamiento de la busqueda anterior i.e. Primero se busca "di" y luego "diego", entonces iteramos sobre la lista previamente filtrada, de otro modo, iteramos sobre la lista original completa
                    list = this.filtered_list 
                } 

                //filtrado
                filtered_list = multiTextFilter2(filters, this.search, list || [])
                this.filtered_list = filtered_list
                this.memorized_filters[`filter_by_${this.filter_by}$search_${this.search}`] = filtered_list

            } else {
                this.filtered_list = this.pre_mapped_list || []
            }

            //actualización de la búsqueda previa
            this.previous_search = this.search
            // console.log("this.previous_search", this.previous_search);
            this.previous_filter = this.filter_by
        }, 100)
    },

    watch: {
        list() {//al actualizarse la lista original tenemos que resetar todo el estado que nos permite optimizar las búsquedas
            this.memorized_filters = {}
            this.previous_search = ''
            this.filterList()
        },

        pre_mapped_list() {
            this.filterList()
        },

        filter_by() {
            this.filterList()
        },

        search() {
            this.filterList()
        }
    }
}