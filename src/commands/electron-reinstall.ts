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
        "- try use `npm init -y` or `yarn init -y` to create your JS/TS project."
      );
      toolbox.print.info("or");
      toolbox.print.info("- try open your JS/TS project.");

      return;
    }

    let electronVersionStr = "";

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

      const { electronVersion } = await toolbox.prompt.ask([
        {
          type: "input",
          name: "electronVersion",
          message:
            "which electron Version do you want to add? (default is lastest)",
          initial: ""
        }
      ]);
      electronVersionStr = electronVersion
        ? `@${electronVersion.replace("@", "")}`
        : "";
    } else {
      const electronVersion =
        packageJson?.dependencies?.electron ||
        packageJson?.devDependencies?.electron;

      electronVersionStr = electronVersion
        ? `@${electronVersion.replace("@", "")}`
        : "";
    }

    const shouldRunInstallElectronScript =
      (await workdir.existsAsync("node_modules")) &&
      (await workdir.existsAsync("node_modules/electron")) &&
      (await workdir.existsAsync("node_modules/electron/package.json"));

    if (!shouldRunInstallElectronScript) {
      const { addElectronCommand } = await toolbox.prompt.ask([
        {
          type: "select",
          name: "addElectronCommand",
          message: "which command do you want to run?",
          choices: [
            `npm install electron${electronVersionStr} -save-dev --ignore-script`,
            `yarn add electron${electronVersionStr} --dev --ignore-scripts`,
            { role: "separator", value: "────" } as any,
            "quit"
          ]
        }
      ]);

      switch (addElectronCommand) {
        case "quit":
          return;

        default:
          const spin = toolbox.print.spin("installing electron to project...");
          const result = await toolbox.system.run(addElectronCommand);
          spin.stopAndPersist({
            text: `installing electron to project finished!`
          });
          toolbox.print.info(`electron ${result || "installed!"}`);
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
    const spin = toolbox.print.spin(
      "installing electron binary to ./node_modules/nelectron..."
    );
    const result = await toolbox.system.run(
      `node ${path.resolve(electronDir.path(), "newInstall.js")}`
    );
    spin.stopAndPersist({
      text: `installing electron binary to ./node_modules/nelectron finished!`
    });
    toolbox.print.info(`electron ${result || "installed!"}`);
    await electronDir.removeAsync("newInstall.js");
  }
};
