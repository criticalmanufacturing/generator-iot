import { inject, injectable } from "inversify";
import { Template, TemplateType } from "../models/template";
import { Log } from "./log";
import * as io from "fs-extra";
import { TYPES } from "../types";
import * as path from "path";
import { Paths } from "./paths";
import { Transpiler } from "./transpiler";
import { BusinessScenario } from "../models/businessScenario";

@injectable()
export class LibraryBusinessScenariosProcessor {

    @inject(TYPES.Logger)
    private _logger: Log;
    @inject(TYPES.Paths)
    private _paths: Paths;
    @inject(TYPES.Transpiler)
    private _transpiler: Transpiler;

    private _finalBusinessScenarios: BusinessScenario[] = [];
    private _businessScenariosDirectory: string;

    public async process(businessScenariosLocation: string | Template[], destination: string): Promise<void> {
        this._logger.Info(` [BusinessScenarios] Processing Business Scenarios`);
        const json: any = io.readJSONSync(destination);

        let businessScenarioMetadata: BusinessScenario[] = json?.criticalManufacturing?.businessScenarios;

        this._finalBusinessScenarios = businessScenarioMetadata ?? [];
        if (this._finalBusinessScenarios != null && this._finalBusinessScenarios?.length > 0) {
            this._logger.Warn(" [BusinessScenarios] Existing business scenarios found in the package.json file found. Merging the new ones with the existing");
        }

        if (typeof businessScenariosLocation === "string") {
            // Assume a path!
            businessScenariosLocation = this._paths.transform(businessScenariosLocation);

            if (!io.existsSync(businessScenariosLocation)) {
                throw new Error(` [BusinessScenarios] Directory '${businessScenariosLocation}' doesn't exist`);
            } else {
                this._businessScenariosDirectory = businessScenariosLocation;

                const files = io.readdirSync(businessScenariosLocation);
                for (const file of files) {
                    if (file.endsWith(".json")) {
                        await this.merge(path.join(businessScenariosLocation, file));
                    }
                }

            }
        } else {
            // Process each template entry
            for (const businessScenarioLocation of businessScenariosLocation) {
                switch (businessScenarioLocation.type) {
                    case TemplateType.Index:
                        await this.processIndex(this._paths.transform(businessScenarioLocation.source));
                        break;
                    case TemplateType.Template:
                        await this.merge(this._paths.transform(businessScenarioLocation.source));
                        break;
                }
            }
        }

        businessScenarioMetadata = this._finalBusinessScenarios;
        io.writeFileSync(destination, JSON.stringify(businessScenarioMetadata, null, 2), "utf8");
    }

    /**
     * Use an index file with an array of files to process
     * using the index as order:
     * [
     *    "first.json",
     *    "second.json"
     * ]
     * @param indexFile The json file with the array of files
     */
    private async processIndex(indexFile: string): Promise<void> {
        const indexPath = path.dirname(indexFile);

        // read array with files
        const files: string[] = io.readJSONSync(indexFile);
        if (!Array.isArray(files)) {
            this._logger.Error(` [BusinessScenarios] Index file '${indexFile}' doesn't contain an array of files to process!`);
        } else {
            for (const file of files) {
                await this.merge(path.join(indexPath, file));
            }
        }
    }

    private async merge(businessScenarioFile: string): Promise<void> {
        this._logger.Info(` [BusinessScenarios] Merging '${businessScenarioFile}'`);

        const newBusinessScenario: BusinessScenario = io.readJSONSync(businessScenarioFile);
        if (newBusinessScenario != null) {
            this._logger.debug(` [BusinessScenarios] Processing Business Scenario '${businessScenarioFile}'`);
            await this.processBusinessScenario(newBusinessScenario ?? {});
            this._logger.debug(` [BusinessScenarios] Processed Business Scenario '${businessScenarioFile}'`);
        }
        this._logger.debug(` [BusinessScenarios] Merged '${businessScenarioFile}'`);
    }

    private async processBusinessScenario(newBusinessScenario: BusinessScenario): Promise<void> {

        if (newBusinessScenario == null || Object.keys(newBusinessScenario).length === 0) {
            return;
        }

        await this._transpiler.preProcessTaskScripts(this._businessScenariosDirectory, newBusinessScenario);

        // Check if there is another with the same name
        const existing = (this._finalBusinessScenarios ?? []).find(c => c.name === newBusinessScenario.name);
        if (existing != null) {
            const existingJson = JSON.stringify(existing);
            const newOneJson = JSON.stringify(newBusinessScenario);

            if (existingJson !== newOneJson) {
                this._logger.Warn(` [BusinessScenarios]   Overwriting Business Scenario '${newBusinessScenario.name}' with a new one`);

                Object.assign(existing, newBusinessScenario);
            }
        } else {
            // New one, so simply add it into the array
            this._finalBusinessScenarios.push(newBusinessScenario);
            this._logger.Info(` [Templates]   Found new Business Scenario '${newBusinessScenario.name}'`);
        }
    }
}