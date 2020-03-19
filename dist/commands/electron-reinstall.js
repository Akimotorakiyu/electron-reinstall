"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mirrorOptionsString = `
  mirrorOptions:{
    mirror: 'https://npm.taobao.org/mirrors/electron/',
    customDir: version,
  },`;
exports.default = {
  description: "electron installer!",
  run(toolbox) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function*() {
      const workdir = yield toolbox.filesystem.dirAsync("");
      const packageJson = yield workdir.readAsync("package.json", "json");
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
          ((_a =
            packageJson === null || packageJson === void 0
              ? void 0
              : packageJson.dependencies) === null || _a === void 0
            ? void 0
            : _a.electron) ||
          ((_b =
            packageJson === null || packageJson === void 0
              ? void 0
              : packageJson.devDependencies) === null || _b === void 0
            ? void 0
            : _b.electron)
        )
      ) {
        toolbox.print.warning(
          "didn't find electron in dependencies or devDependencies, try to add electron package to your project first!"
        );
        toolbox.print.info(
          "- try use `npm install electron -save-dev --ignore-script` or `yarn add electron --dev --ignore-scripts`."
        );
        console.log("aaa", toolbox.prompt.separator);
        const answer = yield toolbox.prompt.ask({
          type: "select",
          name: "addElectronCommand",
          message: "which command do you want to run?",
          choices: [
            "npm install electron -save-dev --ignore-script",
            "yarn add electron --dev --ignore-scripts",
            { role: "separator", value: "────" },
            "quit"
          ]
        });
        switch (answer.addElectronCommand) {
          case "quit":
            return;
          default:
            const spin = toolbox.print.spin("installing...");
            const result = yield toolbox.system.run(answer.addElectronCommand);
            spin.stopAndPersist({
              text: `add finished!`
            });
            toolbox.print.success(`electron ${result || "installed!"}`);
            break;
        }
      }
      const electronDir = yield workdir.dirAsync("./node_modules/electron");
      const installjs = yield electronDir.readAsync("install.js");
      const newInstalljs = installjs.replace(
        /(?<=downloadArtifact\(\{)/,
        mirrorOptionsString
      );
      yield electronDir.writeAsync("newInstall.js", newInstalljs);
      const spin = toolbox.print.spin("installing...");
      const result = yield toolbox.system.run(
        `node ${path.resolve(electronDir.path(), "newInstall.js")}`
      );
      spin.stopAndPersist({
        text: `finished!`
      });
      toolbox.print.success(`electron ${result || "installed!"}`);
      yield electronDir.removeAsync("newInstall.js");
    });
  }
};
