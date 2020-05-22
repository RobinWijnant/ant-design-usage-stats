const fs = require("fs");
const glob = require("glob-promise");
const { jsxToJson } = require("jsx-to-json");

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

const extractComponents = (fileContent, allowedComponentNames) => {
  const extractedJsxFragments = fileContent.match(
    /\(\s*[\S]?\s*<[.\S\s]*?[a-zA-Z]>\s*[\S]?\s*\)}*?;/gm
  );

  if (!extractedJsxFragments) return [];

  const componentsJson = extractedJsxFragments
    .map((extractedJsx) => {
      const componentsJson = jsxToJson(extractedJsx);
      const componentsFlattenedJson = componentsJson.children
        ? flattenComponents(componentsJson)
        : componentsJson;
      return componentsFlattenedJson;
    })
    .flat();

  return componentsJson.filter((componentJson) =>
    allowedComponentNames.includes(componentJson.type)
  );
};

const analyse = async (repoDir, allowedComponentNames) => {
  const filePaths = await glob.promise("**/*.{js,jsx,tsx}", { root: repoDir });
  return filePaths.map(async (path) => {
    const fileContent = await fs.promises.readFile(path, { encoding: "utf8" });
    const extractedComponentsJson = extractComponents(fileContent, allowedComponentNames);
    console.log(extractedComponentsJson);
    return extractedComponentsJson;
  });
};

module.exports = { analyse, extractComponents };
