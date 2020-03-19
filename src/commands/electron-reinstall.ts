import { GluegunToolbox, GluegunCommand } from "gluegun";
import {} from "enquirer";
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
        "- try use `npm init -y` or `yarn init -y` to create your JS/TS project."
      );
      toolbox.print.info("or");
      toolbox.print.info("- try open your JS/TS project.");

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
        "- try use `npm install electron -save-dev --ignore-script` or `yarn add electron --dev --ignore-scripts`."
      );

      console.log("aaa", toolbox.prompt.separator);
      const answer = await toolbox.prompt.ask({
        type: "select",
        name: "addElectronCommand",
        message: "which command do you want to run?",
        choices: [
          "npm install electron -save-dev --ignore-script",
          "yarn add electron --dev --ignore-scripts",
          { role: "separator", value: "────" } as any,
          "quit"
        ]
      });
      switch (answer.addElectronCommand) {
        case "quit":
          return;

        default:
          const spin = toolbox.print.spin("installing...");
          const result = await toolbox.system.run(answer.addElectronCommand);
          spin.stopAndPersist({
            text: `add finished!`
          });
          toolbox.print.success(`electron ${result || "installed!"}`);
          break;
      }
    }

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
};
