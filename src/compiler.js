import jsxLoader from "./jsxLoader";
import jsxPropsTransform from "./jsxPropsTransform";
import Babel from "@babel/core";

export default compile = (src) => {
  Babel.registerPlugin("jsxLoader", jsxLoader);
  Babel.registerPlugin("jsxPropsTransform", jsxPropsTransform);
  var output = Babel.transform(src, {
    presets: [
      [
        "react",
        {
          pragma: "jsx",
          pragmaFrag: "Fragment",
        },
      ],
    ],
    plugins: ["jsxLoader", "jsxPropsTransform"],
  }).code;

  return output;
};
