import R from 'ramda'
import Vue from 'vue'
import {listFilters, isPath, isPathInObjArray, isStringArray} from '../src/list-filters'
import {users, makeUsers} from './list-filters/users.js'

fdescribe('list-filters.js', () => {
	let vm = {}

	beforeEach(() => {
		vm = new Vue({
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div>
			</div>`,
			mixins: [listFilters],
			// ready() {console.log(this.$children);},
			data: {
				list: users.slice(0),//dumplicamos el array para evitar problemas de estado :(
				store: {
					event: {meetings: []}
				},
			},
			components: {},
			methods: {
			}
		}).$mount('body')
		// vm.list = users

	}) 
	
	it('pude encontrar uno o más usuarios por nombre', function(done) {
		vm.filters = {
			name: {
				filters: [isPath(['full_name'])]
			}
		}
		vm.filter_by = 'name'
		vm.search = 'Buddy8'

		setTimeout(() => {
			let found  = [//los nones son Voluntarios
				vm.list[8],
				vm.list[80],
				vm.list[82],
				vm.list[84],
				vm.list[86],
				vm.list[88],
			]
			expect(vm.filtered_list).toEqual(found)
			
			vm.search = 'Buddy88'
			
			setTimeout(()=> {
				expect(vm.filtered_list.map(x => x.full_name)).toEqual([vm.list[88]].map(x => x.full_name))
				done()
			}, 300)
		}, 300)
	});

	it('pude encontrar a uno o más usuarios por estado', function(done) {
		vm.filters = {
			state: {
				filters: [isPathInObjArray(['states'], ['official_name'])]
			}
		}
		vm.filter_by = 'state'
		vm.search = 'statey8'
		
		let found  = [
			vm.list[8],
			vm.list[18],
			vm.list[28],
			vm.list[38],
			vm.list[48],
			vm.list[58],
			vm.list[68],
			vm.list[78],
			vm.list[88],
			vm.list[98]
		]
		setTimeout(()=> {
			expect(vm.filtered_list).toEqual(found)
			done()
		}, 300)
	});

	it('pude buscar en más de un campo a la vez', function(done) {
		vm.list = makeUsers(23)
		vm.filters = {
			multiple_fields: {
				filters: [
					isPath(['full_name']),
					isPathInObjArray(['states'], ['official_name'])
				]
			}
		}
		vm.filter_by = 'multiple_fields'
		vm.search = 'y2'
		
		let found  = [
			vm.list[2],//nombre y estado
			vm.list[12],//nombre y estado
			vm.list[20],//nombre
			// vm.list[21],//nombe este no porque corresponde a Volunteer21, y no hace match con 'y2'
			vm.list[22],//nombre y estado
		]
		setTimeout(()=> {
			expect(vm.filtered_list).toEqual(found)
			done()
		}, 300)
	});

	it('no filtra si el campo search está vació', function(done) {
		vm.list = makeUsers(23)
		vm.filters = {
			multiple_fields: {
				filters: [
					isPath(['full_name']),
					isPathInObjArray(['states'], ['official_name'])
				]
			}
		}
		vm.filter_by = 'multiple_fields'
		vm.search = ''
		
		setTimeout(()=> {
			expect(vm.filtered_list.map(x=> x.full_name)).toEqual(vm.list.map(x=> x.full_name))
			done()
		}, 300)
	});

	it('no filtra si el campo search filter_by', function(done) {
		vm.list = makeUsers(23)
		vm.filters = {
			multiple_fields:  {
				filters: [
					isPath(['full_name']),
					isPathInObjArray(['states'], ['official_name'])
				]
			}
		}
		vm.filter_by = ''
		vm.search = ''
		
		setTimeout(()=> {
			expect(vm.filtered_list.map(x=> x.full_name)).toEqual(vm.list.map(x=> x.full_name))
			done()
		}, 300)
	});

	describe('Performance optimizations', function() {
		it('memoizes past searches', function(done) {
			vm.filters = {
				state: {
					filters: [isPathInObjArray(['states'], ['official_name'])]
				}
			}
			vm.filter_by = 'state'
			vm.search = 'statey8'
			let found  = [
				vm.list[8],
				vm.list[18],
				vm.list[28],
				vm.list[38],
				vm.list[48],
				vm.list[58],
				vm.list[68],
				vm.list[78],
				vm.list[88],
				vm.list[98]
			]
			setTimeout(()=> {
				expect(vm.filtered_list).toEqual(found)
				expect(vm.memorized_filters[`filter_by_state$search_statey8`]).toEqual(vm.filtered_list)

				vm.search = 'statey9'

				setTimeout(()=> {//se mantiene aun después de otra búsqueda
					expect(vm.memorized_filters['filter_by_state$search_statey8']).toEqual(found)
					done()
				}, 300)
			}, 300)
		});

		it('Erases the cache if the original list changes', function(done) {
			vm.filters = {
				state: {
					filters: [isPathInObjArray(['states'], ['official_name'])]
				}
			}
			vm.filter_by = 'state'
			vm.search = 'statey8'
			
			let found  = [
				vm.list[8],
				vm.list[18],
				vm.list[28],
				vm.list[38],
				vm.list[48],
				vm.list[58],
				vm.list[68],
				vm.list[78],
				vm.list[88],
				vm.list[98]
			]

			setTimeout(()=> {
				expect(vm.memorized_filters['filter_by_state$search_statey8']).toEqual(found)
				expect(vm.memorized_filters['filter_by_state$search_statey8'].length).toEqual(found.length)
				let newbuddy = vm.list[98]
				newbuddy.full_name = 'Buddy100'
				vm.list.push(newbuddy)

				Vue.nextTick(()=>{
					expect(vm.memorized_filters['filter_by_state$search_statey8']).toEqual(undefined)
					setTimeout(()=>{
						expect(vm.memorized_filters['filter_by_state$search_statey8'].length).toEqual(found.length + 1)
						done()
					}, 300)
				})
			}, 300)
		});

		
		it('Puede optimizar el filtrado usando el array filtrado con anterioridad, si la búsqueda anterior es un substring de la nueva, pero si filter_by cambia, entonces la optimización no debe operar', function(done) {
			vm.filters = {
				name: {
					filters: [isPath(['full_name'])]
				},
				state: {
					filters: [isPathInObjArray(['states'], ['official_name'])]
				}
			}
			vm.filter_by = 'state'
			vm.search = 'y8'
			
			let states  = [
				vm.list[8],
				vm.list[18],
				vm.list[28],
				vm.list[38],
				vm.list[48],
				vm.list[58],
				vm.list[68],
				vm.list[78],
				vm.list[88],
				vm.list[98]
			]

			let buddies  = [//los nones son Voluntarios
				vm.list[8],
				vm.list[80],
				vm.list[82],
				vm.list[84],
				vm.list[86],
				vm.list[88],
			]

			setTimeout(()=> {
				expect(vm.filtered_list).toEqual(states)
				vm.filter_by = 'name'

				setTimeout(()=>{
					expect(vm.filtered_list).toEqual(buddies)
					done()
				}, 300)
			}, 300)
		});
	});
});


