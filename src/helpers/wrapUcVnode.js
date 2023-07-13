const t = require("@babel/types");

const generateNewNode = require("./generateNewNode");
const findParentVnode = require("./findParentVnode");
const appendBindProp = require("./appendBindProp");
const isUcJsxData = require("./isUcJsxData");

function wrapUcVnode(path, matches) {
  let mObj = {};
  matches.map((m) => {
    mObj[m] = m;
  });
  mObj = findParentVnode(mObj, path.parentPath);
  matches = matches.filter((m) => typeof mObj[m] == "string");
  if (matches.length > 0) {
    if (t.isJSXElement(path.container)) {
      let newEl = generateNewNode(matches, path.container);

      path.parentPath.replaceWith(newEl);
      path.parentPath.skip();
    } else {
      let newEl = generateNewNode(matches, path.node);
      path.replaceWith(newEl);
      path.skip();
    }
  }
}

module.exports = wrapUcVnode;
