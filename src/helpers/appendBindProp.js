const t = require("@babel/types");

function appendBindProp(path, identifier, exp, isBind) {
  let bindAttrName = isBind ? "_bind" : "_listen";
  let parent = path.openingElement;

  let bindAttr = parent.attributes.find((a) => a.name.name == bindAttrName);
  let newBindAttrs = [t.objectProperty(identifier, exp)];
  if (bindAttr) {
    parent.attributes = parent.attributes.filter((a) => a.name.name != bindAttrName);
    newBindAttrs = newBindAttrs.concat(bindAttr.value.expression.properties);
  }
  parent.attributes.push(t.jsxAttribute(t.jSXIdentifier(bindAttrName), t.jsxExpressionContainer(t.objectExpression(newBindAttrs))));
}
module.exports = appendBindProp;
