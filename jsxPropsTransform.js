const memberXpressionToLiteral = require("./helpers").memberXpressionToLiteral;

const DataProviders = [
  "uc-data-handler",
  "uc-data-table",
  "uc-data-template",
  "uc-table",
  "uc-data-repeater",
  "uc-repeater",
  "uc-form",
  "uc-data-form",
  "uc-data",
  "uc-table-col",
  "uc-entity-toolbar-templates",
  "uc-entity-toolbar-template",
];

module.exports = function jsxPropsTransform({ types: t }) {
  const transformBindAttr = (props, tag) => {
    let v = props.value;
    if (t.isJSXExpressionContainer(v)) {
      v = v.expression;
    }
    return t.objectProperty(
      t.identifier(tag),
      t.arrowFunctionExpression(
        [t.identifier("cb"), t.identifier("$bind"), t.identifier("Data")],
        t.arrowFunctionExpression([], t.callExpression(t.identifier(`cb`), [t.objectExpression(v.properties)]))
      )
    );
  };

  return {
    name: "jsxPropsTransform",
    visitor: {
      JSXElement: function (path) {
        if (path.node.openingElement && path.node.openingElement.name.name == "uc-template") {
          let attrs = path.node.openingElement.attributes;
          let contentIdVal = attrs.find((node) => node.name && node.name.name == "contentid");
          let contentId;
          let isContentIdExpression = false;
          if (contentIdVal && contentIdVal.value) {
            if (contentIdVal.value.type == "StringLiteral") {
              contentId = JSON.stringify(contentIdVal.value.value);
            } else if (contentIdVal.value.type == "JSXExpressionContainer") {
              contentId = memberXpressionToLiteral(contentIdVal.value.expression);
              isContentIdExpression = true;
            }
          }
          if (!contentId) {
            return t.jsxText("");
          }
          let propAttrs = attrs.map((a) => {
            let v = a.value;
            if (t.isJSXExpressionContainer(v)) {
              v = v.expression;
            }
            return t.objectProperty(t.identifier(a.name.name), v);
          });
          let child = path.node.openingElement.children;
          if (child && child.length > 0) {
            propAttrs.push(
              t.objectProperty(
                t.identifier("__c"),
                t.arrowFunctionExpression([t.identifier("props")], t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), child))
              )
            );
            path.node.openingElement.children = [];
          }
          let replacer;
          if (contentId) {
            if (isContentIdExpression) {
              replacer = t.callExpression(t.identifier(`loadPartialAsync`), [
                t.identifier(contentId),
                t.objectExpression([t.spreadElement(t.identifier("props")), ...propAttrs]),
              ]);
            } else {
              replacer = t.callExpression(t.identifier(`_partialExtern[${contentId}]`), [
                t.objectExpression([t.spreadElement(t.identifier("props")), ...propAttrs]),
              ]);
            }

            //loadPartialAsync
            if (path.parentPath.node.type == "JSXElement") {
              replacer = t.jsxExpressionContainer(replacer);
            }
            path.replaceWith(replacer);
          }

          // return t.jsxExpressionContainer(
          //   t.callExpression(t.identifier(`_partialExtern[${JSON.stringify(contentId)}]`), [
          //     t.objectExpression([t.spreadElement(t.identifier("props")), ...propAttrs]),
          //   ])
          // );
        }
      },
      JSXOpeningElement(path) {
        const existingProps = path.node.attributes.filter(
          (node) => !node.name || (node.name && ["attrs", "data", "_bind", "_listen", "ref", "class"].indexOf(node.name.name) < 0)
        );
        const refs = path.node.attributes.find((node) => node.name && node.name.name == "ref");
        if (refs && refs.value && refs.value.expression) {
          let insertHook = t.objectProperty(
            t.identifier("insert"),
            t.arrowFunctionExpression(
              [t.identifier("vnode")],
              t.assignmentExpression("=", refs.value.expression, t.identifier("vnode.elm"))
            )
          );
          path.node.attributes.push(t.jSXAttribute(t.jSXIdentifier("hook"), t.jsxExpressionContainer(t.objectExpression([insertHook]))));
        }
        const existingBind = path.node.attributes.find((node) => node.name && node.name.name == "_bind");
        const existingListen = path.node.attributes.find((node) => node.name && node.name.name == "_listen");
        const existingData = path.node.attributes.find((node) => node.name && node.name.name == "data");
        path.node.attributes = path.node.attributes.filter(
          (node) => node.name && ["attrs", "on", "hook", "ref", "class"].indexOf(node.name.name) >= 0
        );
        let props = [];
        let on = [];
        if (path.node && path.node.name && path.node.name.name.startsWith("uc-")) {
          //props.push(t.objectProperty(t.identifier("_d"), t.identifier("Data")));
          //props.push(t.objectProperty(t.identifier("_t"), t.identifier("that")));
          let child = path.container.children;
          if (child && child.length > 0) {
            let cProps = [t.identifier("jsx")];
            if (path && path.node && path.node.name && DataProviders.indexOf(path.node.name.name) >= 0) {
              cProps.push(t.identifier("Data"));
            }
            // if (path.node.name.name.startsWith("uc-data-")) {
            //   cProps.push(t.identifier("Data"));
            // }

            props.push(
              t.objectProperty(
                t.identifier("_children"),
                t.arrowFunctionExpression(cProps, t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), child))
              )
            );
            path.container.children = [];
          }
        }

        existingProps.forEach((prop) => {
          if (!prop.name && prop.type == "JSXSpreadAttribute") {
            //console.log(prop.argument);
            props.push(t.spreadElement(prop.argument));
          } else {
            const onM = prop.name.name.match(/^on([A-Z][a-zA-Z]+)/);
            if (onM && onM.length > 1) {
              let v = prop.value;
              if (t.isJSXExpressionContainer(v)) {
                v = v.expression;
              }
              let eventName = onM[1];
              eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);

              on.push(t.objectProperty(t.identifier(eventName), v));
            } else {
              let v = prop.value;
              if (t.isJSXExpressionContainer(v)) {
                v = v.expression;
              }

              props.push(t.objectProperty(t.identifier(prop.name.name), v));
            }
          }
        });

        if (existingBind || existingListen) {
          props.push(t.objectProperty(t.identifier("_sm"), t.identifier("$stateManager")));
        }

        if (existingBind) {
          props.push(transformBindAttr(existingBind, "_bind"));
        }
        if (existingListen) {
          props.push(transformBindAttr(existingListen, "_listen"));
        }

        if (path && path.node && path.node.name && DataProviders.indexOf(path.node.name.name) >= 0) {
          const newProp = t.objectProperty(t.identifier("_ParentData"), t.identifier("Data"));
          props.push(newProp);
        }
        if (props) {
          const newProp = t.jSXAttribute(t.jSXIdentifier("props"), t.jsxExpressionContainer(t.objectExpression(props)));
          path.node.attributes.push(newProp);
        }
        if (on && on.length > 0) {
          const newProp = t.jSXAttribute(t.jSXIdentifier("on"), t.jsxExpressionContainer(t.objectExpression(on)));
          path.node.attributes.push(newProp);
        }

        if (existingData) {
          let v = existingData.value;

          if (t.isJSXExpressionContainer(v)) {
            v = v.expression;
          }
          const newProp = t.jSXAttribute(t.jSXIdentifier("dataset"), t.jsxExpressionContainer(v));
          path.node.attributes.push(newProp);
        }
      },
    },
  };
};
