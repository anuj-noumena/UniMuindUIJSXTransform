const memberXpressionToLiteral = (exp) => {
  if (typeof exp == "string") {
    return exp;
  } else if (exp) {
    let name = exp.name || "";
    let property = (exp.property && exp.property.name) || "";
    let strA = [];
    if (name) {
      strA.push(name);
    }
    if (exp.object) {
      strA.push(memberXpressionToLiteral(exp.object));
    }
    if (property) {
      strA.push(property);
    }
    if (strA.length > 0) {
      return strA.join(".");
    }
  }
};

module.exports = { memberXpressionToLiteral };
