import { GluegunToolbox, GluegunCommand } from "gluegun";
import * as path from "path";
const mirrorOptionsString = `
  mirrorOptions:{
    mirror: 'https://npm.taobao.org/mirrors/electron/',
    customDir: version,
  },`;
export default <GluegunCommand>{
  description: "electron installer!",
  async run(toolbox: GluegunToolbox) {
    const workdir = await toolbox.filesystem.dirAsync("");
    const packageJson = await workdir.readAsync("package.json", "json");

    if (
      packageJson?.dependencies?.electron ||
      packageJson?.devDependencies?.electron
    ) {
      const electronDir = await workdir.dirAsync("./node_modules/electron");

      const installjs = await electronDir.readAsync("install.js");

      const newInstalljs = installjs.replace(
        /(?<=downloadArtifact\(\{)/,
        mirrorOptionsString
      );

      await electronDir.writeAsync("newInstall.js", newInstalljs);
      const spin = toolbox.print.spin("installing...");
      const result = await toolbox.system.run(
        `node ${path.resolve(electronDir.path(), "newInstall.js")}`
      );
      spin.stopAndPersist({
        text: `finished!`
      });
      toolbox.print.success(`electron ${result || "installed!"}`);
      await electronDir.removeAsync("newInstall.js");
    } else {
      toolbox.print.warning(
        "didn't find electron in dependencies or devDependencies, add electron package to your project first!"
      );
      toolbox.print.warning(
        "`yarn add -D electron` or `npm install --save-dev electron`."
      );
    }
  }
};
