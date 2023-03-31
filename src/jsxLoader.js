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

function replaceTemplate(content) {
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
  let c = doc.querySelector("#mainTemplate");
  let cText = "";
  let imp = {};
  if (c) {
    cText = `
      ${c.textContent.trim().replace(/(;)+$/, "")}
    `.trim();
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

  let c3 = doc.querySelector("#mainStyle");
  let css = "";
  if (c3) {
    c3 = c3.textContent.trim();
    const result = await postcss.process(c3, { from: undefined });
    if (result) {
      css = result.css;
    }
  }

  impStr += `
           const Data = {};
           export const mainStyle = "${css}";
           export const pageConfig = {};
           export const _readyFn = {fn: null};
           const _partialExtern = {};
           export const $stateManager = new UniMindSoftwareUI.Utils.StateManager({});
           const $bind = $stateManager.state;
           const loadPartialAsync = UniMindSoftwareUI.Utils.PartialContentParser.loadPartialAsync;
           const onReady = (fn) => {
              if(typeof fn == "function") _readyFn.fn = fn;
           }
           export const __initialize = async () => {
              const result = await UniMindSoftwareUI.Utils.PartialContentParser.loadPartials(${JSON.stringify(impK)});
              Object.keys(result).map(k => _partialExtern[k] = result[k]);
           };
    `;

  //cText = generateCode(cText);
  //m = generateCode(m);
  let template = `
  ${impStr}

  ${m}
  
  export const __render = (jsx, props,  Data) => ${cText || "null"};`;
  return template;
};
