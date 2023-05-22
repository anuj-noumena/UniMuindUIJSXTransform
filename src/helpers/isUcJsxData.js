function isUcJsxData(node) {
  if (node && node.type == "CallExpression" && node.callee.name == "_ucJsxData") {
    return node;
  }
  return false;
}

module.exports = isUcJsxData;
