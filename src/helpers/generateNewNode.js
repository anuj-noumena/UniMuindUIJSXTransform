const t = require("@babel/types");

function generateNewNode(matches, path) {
  let exp = path;
  if (path.type == "JSXExpressionContainer") {
    exp = path.expression;
  }
  return t.jsxExpressionContainer(
    t.callExpression(t.identifier(`UniMindSoftwareUI.Utils.PartialContentParser.bindNode`), [
      t.identifier("Data"),
      t.identifier("props"),
      t.identifier("$stateManager"),
      t.arrowFunctionExpression([], exp),
      t.arrowFunctionExpression([], t.arrayExpression(matches.map((v, i) => t.identifier(v)))),
    ])
  );
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
}
module.exports = generateNewNode;
