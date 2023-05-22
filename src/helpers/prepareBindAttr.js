const t = require("@babel/types");

function prepareBindAttr(o, attr, isBind) {
    let bindAttr = isBind ? "_bind" : "_listen";
    let bindedProps = [];
    const existingBind = o.attributes.find((node) => node.name && node.name.name == bindAttr);
    o.attributes = o.attributes.filter((node) => node.name && node.name.name != bindAttr && node.name.name != "_ParentData");
  
    if (attr.value.type == "JSXExpressionContainer") {
      bindedProps.push(t.objectProperty(t.identifier(attr.name.name), attr.value.expression));
    }
  
    if (existingBind) {
      let v = existingBind.value;
      if (t.isJSXExpressionContainer(v)) {
        v = v.expression;
      }
      if (v.properties.find((p) => p.key.name == attr.name.name)) {
        bindedProps = [];
      }
      bindedProps = bindedProps.concat(v.properties);
    }
    if (bindedProps.length > 0) {
      o.attributes.push(t.jSXAttribute(t.jSXIdentifier(bindAttr), t.jsxExpressionContainer(t.objectExpression(bindedProps))));
    }
  }
  

module.exports = prepareBindAttr;
