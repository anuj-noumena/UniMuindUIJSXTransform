
function getAttribute(path, el) {
    if (path.node.type === "JSXElement" && !el) {
      return false;
    }
  
    if (path && path.node && path.node.type === "JSXAttribute") {
      if (el) {
        const openingElement = path.parentPath?.container?.openingElement;
        if (openingElement?.name) {
          return openingElement.name.name.startsWith(el) ? path : false;
        }
      } else {
        return path;
      }
    }
  
    return path && path.parentPath ? getAttribute(path.parentPath, el) : false;
  }
  
  module.exports = getAttribute;