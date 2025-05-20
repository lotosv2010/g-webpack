const indexCss = require("./index.css");
const moduleCss = require("./module.css");

console.log(indexCss, moduleCss);

const div = document.createElement("div");
div.className = moduleCss.background ?? moduleCss.locals?.background;
div.innerHTML = 'div';
document.body.appendChild(div)
