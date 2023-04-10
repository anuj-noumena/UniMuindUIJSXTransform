const { parse } = require("node-html-parser");
var babel = require("@babel/core");

const generate = require("@babel/generator").default;
let PostCss = require("postcss");
let cssnano = require("cssnano");
const litePreset = require("cssnano-preset-lite");

const preset = litePreset({ discardComments: true, svgo: false });

const postcss = PostCss([cssnano({ preset })]);

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

function getTemplateTagContentIds(content) {
  let matches = content.match(/<\s*uc-template[^>]*?contentid=\"(.*?)\"/gi);
  let contentIds = {};
  if (Array.isArray(matches)) {
    matches.map((m) => {
      let contentid = m.match(/contentid="([^"]+)/i);
      if (Array.isArray(contentid) && contentid.length == 2) {
        //content = content.replace(m, `{_partialExtern[${JSON.stringify(contentid[1])}](props)}`);
        contentIds[contentid[1]] = 1;
      }
    });
  }
  return { content, contentIds };
}


module.exports = async function (source) {
  let doc = parse(source || "");
  let tempDom = doc.querySelector("#mainTemplate");
  const mainTemplate = tempDom ? tempDom.textContent.trim().replace(/(;)+$/, "") : "";
  let tempCompids = getTemplateTagContentIds(mainTemplate);
  let contentIds = tempCompids.contentIds;

  tempDom = doc.querySelector("#mainScript");
  const mainScript = tempDom ? tempDom.textContent.trim() : "";
  tempCompids = getTemplateTagContentIds(mainScript);
  Object.assign(contentIds, tempCompids.contentIds);

  tempDom = doc.querySelector("#mainStyle");
  let css = "";
  if (tempDom) {
    const mainStyle = tempDom ? tempDom.textContent.trim() : "";
    const result = await postcss.process(mainStyle, { from: undefined });
    if (result) {
      css = result.css;
    }
  }

  let template = `
  const Data = {};
  const _partialExtern = {};
  const loadDynamicContentId = UniMindSoftwareUI.Utils.PartialContentParser.loadDynamicContentId;
  export const mainStyle = "${css}";
  export const pageConfig = {};
  export const _readyFn = {fn: null};
  export const $stateManager = new UniMindSoftwareUI.Utils.StateManager({uuid: "d11"});
  const $bind = $stateManager.state;
  const onReady = (fn) => {
     if(typeof fn == "function") _readyFn.fn = fn;
  }

  export const __initialize = async () => {
    const result = await UniMindSoftwareUI.Utils.PartialContentParser.getLayoutRenderFns(${JSON.stringify(Object.keys(contentIds))});
    Object.keys(result).map(k => _partialExtern[k] = result[k]);
  };

  ${mainScript}

  export const __render = (jsx, Data, props) => ${mainTemplate || "null"};`;
  
  return template;
};
