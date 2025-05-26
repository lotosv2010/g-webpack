const _  = require("lodash");
import $ from "jquery";

const indexCss = require("./index.css");
const moduleCss = require("./module.css");

console.log(indexCss, moduleCss);

const div = document.createElement("div");
div.className = moduleCss.background ?? moduleCss.locals?.background;
div.innerHTML = 'div';
document.body.appendChild(div)

console.log(_.map([1, 2, 3], (item) => item * 2));
console.log($.map([1, 2, 3], (item) => item * 2));
