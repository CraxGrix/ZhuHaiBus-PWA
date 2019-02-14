import DATA from '@/assets/json/info.json'
const R = require('ramda')
const FP = {
	_: (prop, obj) => R.prop(prop, obj),
}
export const characterMatchRoute = str => DATA.filter(router => str === FP._('Name', router))
export const getInfoById = id => DATA.find(info => info.Id === id)



