const t = require("@babel/types");

const generateNewNode = require("./generateNewNode");
const findParentVnode = require("./findParentVnode");
const appendBindProp = require("./appendBindProp");
const isUcJsxData = require("./isUcJsxData");

let genNewNode = (matches, path) => {
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier("uc-data"), [
      t.jsxAttribute(
        t.jsxIdentifier("_listen"),
        t.jsxExpressionContainer(
          t.objectExpression(
            matches.map((v, i) => {
              return t.objectProperty(t.identifier("_bK" + i), t.identifier(v));
            })
          )
        )
      ),
    ]),
    t.jsxClosingElement(t.jsxIdentifier("uc-data")),
    [path]
  );
};

function wrapUcVnode(path, matches) {
  let mObj = {};
  matches.map((m) => {
    mObj[m] = m;
  });
  mObj = findParentVnode(mObj, path.parentPath);
  matches = matches.filter((m) => typeof mObj[m] == "string");

  if (matches.length > 0) {
    let pp = isUcJsxData(path.parentPath.node);
    if (pp) {
      matches.map((m) => {
        appendBindProp(path.parentPath.node, t.identifier(`_st${new Date().getTime()}`), t.identifier(m), false);
      });
    } else {
      if (t.isJSXElement(path.container)) {
        let newEl = generateNewNode(matches, path.container);
        
        path.parentPath.replaceWith(newEl);
        path.parentPath.skip()
      } else {
        let newEl = generateNewNode(matches, path.node);
        path.replaceWith(newEl);
        //path.skip()
      }
    }
  }
}

module.exports = wrapUcVnode;
