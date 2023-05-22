const memberXpressionToLiteral = require("./memberXpressionToLiteral");
const isUcJsxData = require("./isUcJsxData");

function findParentVnode(matches, path) {
  if (path && isUcJsxData(path.node)) {
    if (path.node.arguments && Array.isArray(path.node.arguments) && path.node.arguments.length > 0) {
      const args = path.node.arguments[0];
      if (args.type == "ObjectExpression" && Array.isArray(args.properties)) {
        args.properties.forEach((p) => {
          if (p.key.name == "_listen" && p.value.type == "ObjectExpression" && Array.isArray(p.value.properties)) {
            p.value.properties.forEach((p2) => {
              let key = memberXpressionToLiteral(p2.key);
              let match = matches[key];
              if (match && typeof match === "string") {
                matches[key] = path;
              }
            });
          }
        });
        if (Object.keys(matches).filter((m) => typeof matches[m] === "string").length === 0) {
          return matches;
        }
      }
    }
  } else if (!path || !path.parentPath) {
    return matches;
  }

  return findParentVnode(matches, path.parentPath);
}
module.exports = findParentVnode;
