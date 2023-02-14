const { parse } = require("node-html-parser");
var babel = require("@babel/core");
var t = require("@babel/types");
const memberXpressionToLiteral = require("./helpers").memberXpressionToLiteral;
const generate = require("@babel/generator").default;

function replaceTemplate(content) {
  let matches = content.match(/<\s*uc-template[^>]*?contentid=\"(.*?)\"/gi);
  let contentIds = {};
  if (Array.isArray(matches)) {
    matches.map((m) => {
      let contentid = m.match(/contentid="([^"]+)/);
      if (Array.isArray(contentid) && contentid.length == 2) {
        //content = content.replace(m, `{_partialExtern[${JSON.stringify(contentid[1])}](props)}`);
        contentIds[contentid[1]] = 1;
      }
    });
  }
  return { content, contentIds };
}

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
    bindedProps = bindedProps.concat(v.properties);
  }
  if (bindedProps.length > 0) {
    o.attributes.push(t.jSXAttribute(t.jSXIdentifier(bindAttr), t.jsxExpressionContainer(t.objectExpression(bindedProps))));
    o.attributes.push(t.jSXAttribute(t.jSXIdentifier("_ParentData"), t.jsxExpressionContainer(t.identifier("Data"))));
  }
}

function generateCode(cText) {
  let ast = babel.parse(cText, {
    presets: [
      [
        "@babel/preset-env",
        {
          loose: true,
          modules: false,
          useBuiltIns: false,
          targets: {
            browsers: ["last 2 versions", "safari >= 7"],
          },
        },
      ],
    ],
    plugins: [
      [
        "@babel/plugin-proposal-class-properties",
        {
          loose: true,
        },
      ],
      [
        "@babel/plugin-transform-react-jsx",
        {
          pragma: "jsx",
          pragmaFrag: "Fragment",
        },
      ],
    ],
  });
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

  let isAttr = (path, el) => {
    if (path.node.type == "JSXElement" && !el) {
      return false;
    }
    if (path && path.node && path.node.type == "JSXAttribute") {
      if (el) {
        if (
          path.parentPath &&
          path.parentPath.container &&
          path.parentPath.container.openingElement &&
          path.parentPath.container.openingElement.name
        ) {
          if (path.parentPath.container.openingElement.name.name.startsWith(el)) {
            return path;
          } else {
            return false;
          }
        }
      } else {
        return path;
      }
    }
    if (path && path.parentPath) {
      return isAttr(path.parentPath, el);
    }
    return false;
  };

  let findParentExpressionContainer = (path) => {
    if (path.node.type == "JSXExpressionContainer") {
      return path;
    }
    if (path && path.parentPath) {
      return findParentExpressionContainer(path.parentPath);
    }
    return false;
  };

  let wrapUcVnode = (path, matches) => {
    let mObj = {};
    matches.map((m) => {
      mObj[m] = m;
    });
    mObj = findParentVnode(mObj, path.parentPath);
    matches = matches.filter((m) => typeof mObj[m] == "string");
    if (matches.length > 0) {
      let pp = prevParentVnode(path.parentPath.node);
      if (!pp) {
        if (t.isJSXElement(path.container)) {
          let newEl = genNewNode(matches, path.container);
          path.parentPath.replaceWith(newEl);
        } else {
          let newEl = genNewNode(matches, path.node);
          path.replaceWith(newEl);
        }
      }
      if (pp) {
        matches.map((m) => {
          appendBindProp(path.parentPath.node, t.identifier(`_st${new Date().getTime()}`), t.identifier(m), false);
        });
      }
    }
  };
  let findParentVnode = (matches, path) => {
    if (
      path &&
      path.node &&
      path.node.openingElement &&
      path.node.openingElement.name.name == "uc-data" &&
      path.node.openingElement.attributes
    ) {
      let bindAttrs = path.node.openingElement.attributes.find((a) => a.name.name == "_listen");
      if (bindAttrs && bindAttrs.value.expression && bindAttrs.value.expression.properties) {
        bindAttrs.value.expression.properties.map((p) => {
          let key = memberXpressionToLiteral(p.value);
          let match = matches[key];
          if (match && typeof match == "string") {
            matches[key] = path;
          }
          //console.log(cText.substring(p.start, p.end));
        });
        if (Object.keys(matches).filter((m) => typeof matches[m] == "string").length == 0) {
          return matches;
        }
      }
      //return false;
    } else if (!path || !path.parentPath) {
      return matches;
    }

    return findParentVnode(matches, path.parentPath);
  };

  let prevParentVnode = (node) => {
    if (node && node.openingElement && node.openingElement.name.name == "uc-data") {
      return node;
      //return false;
    }
    return false;
  };

  let appendBindProp = (path, identifier, exp, isBind) => {
    let bindAttrName = isBind ? "_bind" : "_listen";
    let parent = path.openingElement;

    let bindAttr = parent.attributes.find((a) => a.name.name == bindAttrName);
    let newBindAttrs = [t.objectProperty(identifier, exp)];
    if (bindAttr) {
      parent.attributes = parent.attributes.filter((a) => a.name.name != bindAttrName);
      newBindAttrs = newBindAttrs.concat(bindAttr.value.expression.properties);
    }
    parent.attributes.push(t.jsxAttribute(t.jSXIdentifier(bindAttrName), t.jsxExpressionContainer(t.objectExpression(newBindAttrs))));
  };

  babel.traverse(ast, {
    MemberExpression: function (path) {
      let literal = memberXpressionToLiteral(path.node);
      let matches = [...new Set(literal.match(/^(\$bind|Data)\.[a-zA-Z_$0-9\.]+/g))];
      if (matches.length > 0) {
        let el = isAttr(path, ""); // check if attribute
        if (el) {
          if (el.node && ["_bind", "_listen"].indexOf(el.node.name.name) < 0) {
            if (el.node.value && el.node.value.expression) {
              //bind
              //expression inside attribute
              let elO = el.parentPath.container.openingElement;
              let elName = el.parentPath.container.openingElement.name.name;
              if (elName.startsWith("uc-")) {
                if (elName == "uc-template") {
                  wrapUcVnode(el.parentPath, matches);
                } else {
                  prepareBindAttr(elO, el.node, memberXpressionToLiteral(el.node.value.expression) == literal);
                }
              } else {
                if (memberXpressionToLiteral(el.node.value.expression) == literal && el.node.name.name == "value") {
                  let elO = el.parentPath.container.openingElement;
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
                }
                wrapUcVnode(el.parentPath, matches);
              }
            }
          }
        } else {
          let pexp = findParentExpressionContainer(path);
          //console.log(literal);
          if (pexp) {
            wrapUcVnode(pexp, matches);
          }
          //wrap the expression
          //wrapUcVnode(el.parentPath, matches);
        }
      }
      path.skip();
    },
  });

  const output = generate(
    ast,
    {
      type: "Program",
      /* options */
    },
    cText
  );
  return output.code;
}

module.exports = function (source) {
  let doc = parse(source);
  let c = doc.querySelector("#mainTemplate");
  let cText = "";
  let imp = {};
  if (c) {
    cText = `
      ${c.textContent.trim().replace(/(;)+$/, "")}
    `;
    let o1 = replaceTemplate(cText);
    //cText = o1.content;
    imp = o1.contentIds;
  }
  let c2 = doc.querySelector("#mainScript");
  let m = "";
  if (c2) {
    m = c2.textContent.trim();
    let o1 = replaceTemplate(m);
    //m = o1.content;
    imp = { ...imp, ...o1.contentIds };
  }
  let impStr = "";
  const impK = Object.keys(imp);

  impStr += `
           const Data = {};
           export const pageConfig = {};
           export const _readyFn = {fn: null};
           const _partialExtern = {};
           const $stateManager = new UniMindSoftwareUI.Utils.StateManager({});
           const $bind = $stateManager.state;
           const loadPartialAsync = UniMindSoftwareUI.Utils.PartialContentParser.loadPartialAsync;
           const onReady = (fn) => {
              if(typeof fn == "function") _readyFn.fn = fn;
           }
           export const __initialize = () => {
              return UniMindSoftwareUI.Utils.PartialContentParser.loadPartials(${JSON.stringify(impK)}).then((out) => {
                Object.keys(out).map(k => _partialExtern[k] = out[k]);
              })
           };
    `;

  cText = generateCode(cText);
  m = generateCode(m);

  let template = `
  ${impStr}

  ${m}
  
  export function __render(jsx, props, Data){
    return ${cText}
  }`;
  return template;
};
