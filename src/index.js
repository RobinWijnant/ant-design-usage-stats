const repoHelper = require("./repoHelper");
const codeAnalyser = require("./codeAnalyser");
const config = require("../config");
let offsetId;

(async () => {
  while (true) {
    const { dependents, nextOffsetId } = await repoHelper.fetchDependents(
      config.githubRepo,
      offsetId
    );
    console.log(`New dependents fetched with offset id: ${offsetId}`);
    offsetId = nextOffsetId;

    const promises = dependents.map(async (dependent) => {
      try {
        const cacheDir = path.join(process.cwd(), config.cacheDir);
        const clonedRepoDir = await repoHelper.cloneRepo(dependent.name, dependent.url, cacheDir);
        console.log(`[${dependent.name}] Git clone successful`);
        const report = await codeAnalyser.analyse(clonedRepoDir, config.components);
        console.log(report);
      } catch (error) {
        console.error(error);
        console.warn(`[${dependent.name}] ${error.message}`);
      }
    });
    await Promise.all(promises);
  }
})();
