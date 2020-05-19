const repoHelper = require("./repoHelper");
const codeAnalyser = require("./codeAnalyser");

const package = "ant-design/ant-design";
const components = ["Input"];
let offsetId;

(async () => {
  while (true) {
    const { dependents, nextOffsetId } = await repoHelper.fetchDependents(package, offsetId);
    console.log(`New dependents fetched with offset id: ${offsetId}`);
    offsetId = nextOffsetId;

    const promises = dependents.map(async (dependent) => {
      try {
        const dir = await repoHelper.cloneRepo(dependent.name, dependent.url);
        console.log(`[${dependent.name}] Git clone successful`);
        const report = await codeAnalyser.analyse(dir, components);
        console.log(report);
      } catch (error) {
        console.error(error);
        console.warn(`[${dependent.name}] ${error.message}`);
      }
    });
    await Promise.all(promises);
  }
})();
