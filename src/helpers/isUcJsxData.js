function isUcJsxData(node) {
  if (node.openingElement && node.openingElement.name.name == "uc-data" && node.openingElement.attributes) {
    return node;
  }
  return false;
}

module.exports = isUcJsxData;
