const t = require("@babel/types");

function generateNewNode(matches, path) {
  const attributes = matches.map((v, i) => t.objectProperty(t.identifier("_bK" + i), t.identifier(v)));

  return t.callExpression(t.identifier("_ucJsxData"), [
    t.objectExpression([
      t.objectProperty(t.identifier("_listen"), t.objectExpression(attributes)),
      t.objectProperty(
        t.identifier("_children"),
        t.arrowFunctionExpression([t.identifier("props")], t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [path]))
      ),
    ]),
  ]);
}
module.exports = generateNewNode;
