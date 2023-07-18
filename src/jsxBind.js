const babel = require("@babel/core");
const t = require("@babel/types");
const memberXpressionToLiteral = require("./helpers/memberXpressionToLiteral");

// Helper functions

const getAttribute = require("./helpers/getAttribute");
const findParentExpressionContainer = require("./helpers/findParentExpressionContainer");
const wrapUcVnode = require("./helpers/wrapUcVnode");
const prepareBindAttr = require("./helpers/prepareBindAttr");

// Main function

const traverseForBind = (ast) => {
  babel.traverse(ast, {
    MemberExpression: function (path) {
      let literal = memberXpressionToLiteral(path.node);
      let matches = [...new Set(literal.match(/^(\$bind|Data)\.[a-zA-Z_$0-9\.]+/g))];

      if (matches.length > 0) {
        let el = getAttribute(path, "");
        if (el && el.node && ["_bind", "_listen"].indexOf(el.node.name.name) < 0) {
          if (el.node.value && el.node.value.expression) {
            handleAttribute(path, el, matches, literal);
          }
        } else {
          let pexp = findParentExpressionContainer(path);
          if (pexp) {
            wrapUcVnode(pexp, matches);
          }
        }
      }
      path.skip();
    },
  });
};

const handleAttribute = (path, el, matches, literal) => {
  let elO = el.parentPath.container.openingElement;
  let elName = el.parentPath.container.openingElement.name.name;

  if (elName.startsWith("uc-")) {
    //if (elName == "uc-template") {
      //wrapUcVnode(el.parentPath, matches);
    //} else {
      prepareBindAttr(elO, el.node, memberXpressionToLiteral(el.node.value.expression) == literal);
    //}
  } else {
    if (memberXpressionToLiteral(el.node.value.expression) == literal && el.node.name.name == "value") {
      handleValueAttribute(elO, el);
    }
    wrapUcVnode(el.parentPath, matches);
  }
};

const handleValueAttribute = (elO, el) => {
  if (!elO.attributes.find((a) => a.name.name == "onChange")) {
    elO.attributes.push(
      t.jsxAttribute(
        t.jSXIdentifier("onChange"),
        t.jsxExpressionContainer(
          t.arrowFunctionExpression(
            [t.identifier("e")],
            t.assignmentExpression("=", el.node.value.expression, t.identifier("e.target.value"))
          )
        )
      )
    );
  }
};

module.exports = { traverseForBind };
