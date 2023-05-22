function findParentExpressionContainer(path) {
  if (path.node.type === "JSXExpressionContainer") {
    return path;
  }
  return path && path.parentPath ? findParentExpressionContainer(path.parentPath) : false;
}

module.exports = findParentExpressionContainer;