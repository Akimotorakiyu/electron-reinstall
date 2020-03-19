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

    if (!packageJson) {
      toolbox.print.warning(
        "Didn't find `package.json`, is this dir is a JS/TS project? Maybe you should open or create your JS/TS project first?"
      );

      toolbox.print.info(
        "- try use `npm init` or `yarn init` to create your JS/TS project."
      );

      return;
    }

    if (
      !(
        packageJson?.dependencies?.electron ||
        packageJson?.devDependencies?.electron
      )
    ) {
      toolbox.print.warning(
        "didn't find electron in dependencies or devDependencies, try to add electron package to your project first!"
      );

      toolbox.print.info(
        "- try use `npm install electron -save-dev --ignore-script` or `yarn add electron --dev --ignore-script`."
      );

      return;
    }

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
    }
  }
};
