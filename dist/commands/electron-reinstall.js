"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const workdir = yield toolbox.filesystem.dirAsync("");
            const packageJson = yield workdir.readAsync("package.json", "json");
            if (!packageJson) {
                toolbox.print.warning("Didn't find `package.json`, is this dir is a JS/TS project? Maybe you should open or create your JS/TS project first?");
                toolbox.print.info("- try use `npm init -y` or `yarn init -y` to create your JS/TS project.");
                toolbox.print.info("or");
                toolbox.print.info("- try open your JS/TS project.");
                return;
            }
            let electronVersionStr = "";
            if (!(((_a = packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) === null || _a === void 0 ? void 0 : _a.electron) || ((_b = packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) === null || _b === void 0 ? void 0 : _b.electron))) {
                toolbox.print.warning("didn't find electron in dependencies or devDependencies, try to add electron package to your project first!");
                toolbox.print.info("- try use `npm install electron -save-dev --ignore-script` or `yarn add electron --dev --ignore-scripts`.");
                const { electronVersion } = yield toolbox.prompt.ask([
                    {
                        type: "input",
                        name: "electronVersion",
                        message: "which electron Version do you want to add? (default is lastest)",
                        initial: ""
                    }
                ]);
                electronVersionStr = electronVersion
                    ? `@${electronVersion.replace("@", "")}`
                    : "";
            }
            else {
                const electronVersion = ((_c = packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) === null || _c === void 0 ? void 0 : _c.electron) || ((_d = packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) === null || _d === void 0 ? void 0 : _d.electron);
                electronVersionStr = electronVersion
                    ? `@${electronVersion.replace("@", "")}`
                    : "";
            }
            const shouldRunInstallElectronScript = (yield workdir.existsAsync("node_modules")) &&
                (yield workdir.existsAsync("node_modules/electron")) &&
                (yield workdir.existsAsync("node_modules/electron/package.json"));
            if (!shouldRunInstallElectronScript) {
                const { addElectronCommand } = yield toolbox.prompt.ask([
                    {
                        type: "select",
                        name: "addElectronCommand",
                        message: "which command do you want to run?",
                        choices: [
                            `npm install electron${electronVersionStr} -save-dev --ignore-script`,
                            `yarn add electron${electronVersionStr} --dev --ignore-scripts`,
                            { role: "separator", value: "────" },
                            "quit"
                        ]
                    }
                ]);
                switch (addElectronCommand) {
                    case "quit":
                        return;
                    default:
                        const spin = toolbox.print.spin("installing electron to project...");
                        const result = yield toolbox.system.run(addElectronCommand);
                        spin.stopAndPersist({
                            text: `installing electron to project finished!`
                        });
                        toolbox.print.info(`electron ${result || "installed!"}`);
                        break;
                }
            }
            const electronDir = yield workdir.dirAsync("./node_modules/electron");
            const installjs = yield electronDir.readAsync("install.js");
            const newInstalljs = installjs.replace(/(?<=downloadArtifact\(\{)/, mirrorOptionsString);
            yield electronDir.writeAsync("newInstall.js", newInstalljs);
            const spin = toolbox.print.spin("installing electron binary to ./node_modules/nelectron...");
            const result = yield toolbox.system.run(`node ${path.resolve(electronDir.path(), "newInstall.js")}`);
            spin.stopAndPersist({
                text: `installing electron binary to ./node_modules/nelectron finished!`
            });
            toolbox.print.info(`electron ${result || "installed!"}`);
            yield electronDir.removeAsync("newInstall.js");
        });
    }
};
