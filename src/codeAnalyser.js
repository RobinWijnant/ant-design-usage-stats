const fs = require("fs");
const glob = require("glob-promise");
const path = require("path");
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
      console.log(extractedJsx);
      const componentsJson = jsxToJson(extractedJsx);
      console.log(componentsJson);
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
  const filePaths = await glob.promise("**/*.{js,jsx,tsx}", { cwd: repoDir });
  const analyseFilePromises = filePaths.map(async (filePath) => {
    const fileContent = await fs.promises.readFile(path.join(repoDir, filePath), {
      encoding: "utf8",
    });
    const extractedComponentsJson = extractComponents(fileContent, allowedComponentNames);
    return extractedComponentsJson;
  });
  return Promise.all(analyseFilePromises);
};

module.exports = { analyse, extractComponents };
