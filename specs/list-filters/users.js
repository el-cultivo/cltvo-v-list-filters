const R = require('ramda')

/**
 * Todos los ususarios generados aqúi pueden ser o buddies (index par) o volutarios (index non).
 * El nombre es Buddy+index o Voluntario+Index
 * Tienen un last number, que es el último número del index. 
 * 	Éste se usa para predecir el nombre del estado y del rol. 
 * 	I.e. para Buddy78, entonces states: [{official_name:"8"}] y budyy.state.official_name: "8"
 */

const buddy_obj = (name, index, last_number) => ({
	"first_name": name,
	"last_name": name,
	"full_name": name+ " Apellido",
	"age": 33+index,
	"state": {
		"official_name": last_number,
	}
})

const user =  (index) => {
	let volunteer = null, buddy = null, name, full_name;
	let last_number = R.compose(
		R.last,
		R.toString
	)(index)
	if (index % 2 === 0 ) {
		name = "Buddy"+index
		full_name = name+ " Apellido"
		buddy = buddy_obj(name, index, last_number)
	} else {
		name = "Volunteer"+index
		full_name = name+ " Apellido"
		volunteer = buddy_obj(name, index, last_number)
	}

	// console.log("name", name);
	// console.log("full_name", full_name);

	let user =  {
		buddy,
		volunteer,
		full_name,
		"id": index,
		"name": name,
		"first_name": name,
		"last_name": name,
		"email": name+"@elcultivo.mx",
		"roles": [
			{
				"label": last_number
			}
		],
		"states": [
			{
				"official_name": 'statey'+last_number,//para empatar el string con la 'Y' de Buddy en algunos tests
			}
		]
	}
		// console.log("user", user.full_name);
	return user
}

const users = module.exports.users = R.range(0, 99).map(user)
module.exports.makeUsers = quantity => R.range(0, quantity).map(user)