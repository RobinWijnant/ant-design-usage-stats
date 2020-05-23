const fs = require("fs");
const glob = require("glob-promise");
const path = require("path");
const babel = require("@babel/core");
const json5 = require("json5");

const babelCodeToJson = (babelCode) => {
  const trimmedJson = babelCode.substring(1, babelCode.length - 2);
};

const flattenComponents = (components) => {
  const childrenComponents = [];

  components.children.forEach((component) => {
    if (Array.isArray(component)) {
      childrenComponents.push(...flattenComponents(component));
    } else {
      childrenComponents.push(component);
    }
  });

  delete components.children;
  return [components, ...childrenComponents];
};

const extractComponents = async (fileContent, allowedComponentNames) => {
  const extractedJsxFragments = fileContent.match(
    /\(\s*[\S]?\s*<[.\S\s]*?[a-zA-Z]>\s*[\S]?\s*\)}*?;/gm
  );

  if (!extractedJsxFragments) return [];

  const componentsJson = extractedJsxFragments
    .map(async (extractedJsx, index) => {
      if (index > 0) return [];
      const { code } = await babel.transformAsync(extractedJsx, {
        plugins: ["transform-jsx"],
      });
      // const parsableJson = babelCodeToJson(code);
      console.log(code);
      const jsxJson = JSON.parse('({"kk": () => {}});');
      const componentFlattenedJson = jsxJson.children ? flattenComponents(jsxJson) : jsxJson;
      return componentFlattenedJson;
    })
    .flat();

  return componentsJson.filter((componentJson) =>
    allowedComponentNames.includes(componentJson.type)
  );
};

const analyse = async (repoDir, allowedComponentNames) => {
  const filePaths = await glob.promise("**/*.{js,jsx,tsx}", { cwd: repoDir });
  const analyseFilePromises = filePaths.map(async (filePath) => {
    const fileContent = await fs.promises.readFile(path.join(repoDir, filePath), {
      encoding: "utf8",
    });
    const extractedComponentsJson = await extractComponents(fileContent, allowedComponentNames);
    return extractedComponentsJson;
  });
  return Promise.all(analyseFilePromises);
};

module.exports = { analyse, extractComponents };
