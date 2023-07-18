const t = require("@babel/types");

const generateNewNode = require("./generateNewNode");
const findParentVnode = require("./findParentVnode");
const appendBindProp = require("./appendBindProp");
const isUcJsxData = require("./isUcJsxData");
const memberXpressionToLiteral = require("./memberXpressionToLiteral");

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
      try {
        let newEl = generateNewNode(matches, path.node);
        if (path.container) {
          path.replaceWith(newEl);
        } else {
          path.node.expression.value = newEl.expression.value;
        }
      } catch (e) {
        console.log(path.replaceWith, replaceNode, replaceNode.replaceWith);
      }

      path.skip();
    }
  }
}

module.exports = wrapUcVnode;
