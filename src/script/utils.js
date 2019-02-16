import DATA from "@/assets/json/info.json";
const R = require("ramda");
const FP = {
  _: (prop, obj) => R.prop(prop, obj)
};
export const characterMatchRoute = str =>
  DATA.filter(router => str === FP._("Name", router));
export const getInfoById = id => DATA.find(info => info.Id === id);
export const filterObj = (prop, val, arr) =>
  R.filter(o => equals(o[prop], val));
export const findIndex = (prop, val, list) =>
  R.findIndex(R.propEq(prop, val))(list);
