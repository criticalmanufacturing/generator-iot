import { Log } from "./log";
import * as io from "fs-extra";
import * as path from "path";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { Paths } from "./paths";

@injectable()
export class ShrinkwrapGenerator {

    @inject(TYPES.Logger)
    private _logger: Log;

    public process(source: string , fileName: string): void {
        let lockFilePath = path.join(source, "package-lock.json");
        let isWorkspaces = false;
        if (!io.existsSync(lockFilePath)) {
            this._logger.Warn(`Package Lock file not found. Assuming this environment is using workspaces`);

            // Search up to 3 levels up
            for (let i = 0; i < 3; i++) {
                const levels = [];
                for (let j = 0; j <= i; j++) {
                    levels.push("..");
                }

                lockFilePath = path.resolve(source, ...levels, "package-lock.json")
                if (io.existsSync(lockFilePath)) {
                    isWorkspaces = true;
                    break;
                }
            }
        }

        if (!io.existsSync(lockFilePath)) {
            this._logger.Error(`Unable to find a suitable package lock file in the directory tree!`);
        } else {
            if (!isWorkspaces) {
                this._logger.Info(`Since this is not a workspace environment, copying package-lock.json file as ${fileName}`);
                io.copyFileSync(lockFilePath, path.join(source, fileName));
            } else {
                const packageJsonLocation = path.join(source, "package.json");
                this._logger.Info(`Reading original package from '${packageJsonLocation}'`);
                const packageJson = io.readJSONSync(packageJsonLocation);
                this._logger.Info(`Reading lock file from '${lockFilePath}'`);
                const lockJson = io.readJSONSync(lockFilePath);            
                
                // now, cleanup the file
                const prefix = source.slice(path.dirname(lockFilePath).length + 1).replace("\\", "/");

                let dependencies: string[] = [];
                for (const key in packageJson.dependencies ?? {}) {
                    dependencies.push(key);
                }
                for (const key in packageJson.peerDependencies ?? {}) {
                    dependencies.push(key);
                }

                // Reprocess the important packages (@criticalmanufacturing/);
                for(const dep of dependencies) {
                    if (dep.startsWith("@criticalmanufacturing/")) {
                        const importantPack = this.searchImportantPackage(lockJson.packages ?? {}, dep);
                        for (const key in importantPack.dependencies ?? {}) {
                            dependencies.push(key);
                        }
                        for (const key in importantPack.peerDependencies ?? {}) {
                            dependencies.push(key);
                        }
                    }
                }

                // Remove duplicates
                dependencies = dependencies.filter((item, index) => dependencies.indexOf(item) === index);

                const result: any = {};

                // First add all entries that match the same name of this path
                for (const key in lockJson.packages) {
                    if (key.startsWith(prefix)) {
                        result[key] = lockJson.packages[key];
                    }
                }

                dependencies.forEach((pack) => {
                    this._logger.Info(`  Adding resolved package information for '${pack}'`);
                    const results = this.searchPackage(lockJson.packages ?? {}, pack);
                    for (const key in results) {
                        result[key] = results[key];
                    }
                });


                this._logger.Info(`Generating '${fileName}' file with relevant dependencies information for this package`)
                io.writeJSONSync(path.join(source, fileName), {
                    name: packageJson.name,
                    version: packageJson.version,
                    packages: result
                }, {
                    spaces: 2
                });
            }
        }
    }

    private searchPackage(full: any, search: string): any {
        const result: any = {};
        for (const key in full) {
            if (key === ("node_modules/" + search) || key.startsWith("node_modules/" + search + "/") || full[key].name === search) {
                result[key] = full[key]
            }
        }

        return (result);
    }

    private searchImportantPackage(full: any, search: string): any {
        for (const key in full) {
            if (full[key].name === search) {
               return (full[key]);
            }
        }

        return ({});
    }
}