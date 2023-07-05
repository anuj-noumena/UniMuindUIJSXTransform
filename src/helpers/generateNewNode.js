const t = require("@babel/types");

function generateNewNode(matches, path) {
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
