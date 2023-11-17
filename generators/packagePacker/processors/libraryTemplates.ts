import { Template, TemplateType } from "../models/template";
import { LibraryConverter, LibraryConverterDefaults, LibraryMetadata, LibraryTask, LibraryTaskDefaults } from "../models/library";

import { Log } from "./log";
import * as io from "fs-extra";
import * as path from "path";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { Paths } from "./paths";

@injectable()
export class LibraryTemplatesProcessor {

    @inject(TYPES.Logger)
    private _logger: Log;
    @inject(TYPES.Paths)
    private _paths: Paths;

    private _finalTemplates: LibraryMetadata = {};

    public process(templateRules: string | Template[], destination: string): void {
        this._logger.Info(` [Templates] Processing library templates`);
        let json: any = io.readJSONSync(destination);
        
        if (json?.criticalManufacturing?.tasksLibrary == null) {
            throw new Error("Unable to read TasksLibrary section of the package.json file")
        }

        let libraryMetadata: any = json.criticalManufacturing.tasksLibrary;

        this._finalTemplates = libraryMetadata.metadata ?? { };
        if (this._finalTemplates != null && ((this._finalTemplates.converters?.length ?? 0) !== 0 || (this._finalTemplates.tasks?.length ?? 0) !== 0)) {

            console.log(this._finalTemplates.tasks?.length);

            this._logger.Warn(" [Templates] Existing templates found in the package.json file found. Merging the new ones with the existing");
        }

        // Prepare the initial object
        this._finalTemplates.converters = this._finalTemplates.converters ?? [];
        this._finalTemplates.tasks = this._finalTemplates.tasks ?? [];

        if (typeof templateRules === "string") {
            // Assume a path!
            templateRules = this._paths.transform(templateRules);

            const files = io.readdirSync(templateRules);
            for (let file of files) {
                if (file.endsWith(".json")) {
                    this.merge(path.join(templateRules, file));
                }
            }
        } else {
            // Process each template entry
            for (let templateRule of templateRules) {
                switch (templateRule.type) {
                    case TemplateType.Index:
                        this.processIndex(this._paths.transform(templateRule.source));
                        break;
                    case TemplateType.Template:
                        this.merge(this._paths.transform(templateRule.source));
                        break;
                }
            }
        }

        libraryMetadata.metadata = this._finalTemplates;
        io.writeFileSync(destination, JSON.stringify(json, null, 2), "utf8");
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
    private processIndex(indexFile: string): void {
        const indexPath = path.dirname(indexFile);

        // read array with files
        const files: string[] = io.readJSONSync(indexFile);
        if (!Array.isArray(files)) {
            this._logger.Error(` [Templates] Index file '${indexFile}' doesn't contain an array of files to process!`);
        } else {
            for (let file of files) {
                this.merge(path.join(indexPath, file));
            }
        }
    }

    private merge(templateFile: string): void {
        this._logger.Info(` [Templates] Merging '${templateFile}'`);

        const newTemplates: LibraryMetadata = io.readJSONSync(templateFile);
        if (newTemplates != null) {
            this.mergeConverters(newTemplates.converters ?? []);
            this.mergeTasks(newTemplates.tasks ?? []);
        }
    }

    private mergeConverters(converters: LibraryConverter[]) {
        converters.forEach(converter => {
            const newOne = Object.assign({}, LibraryConverterDefaults, converter);

            // Check if there is another with the same name
            const existing = (this._finalTemplates.converters ?? []).find(c => c.name === newOne.name);
            if (existing != null) {
                const existingJson = JSON.stringify(existing);
                const newOneJson = JSON.stringify(newOne);
                if (existingJson !== newOneJson) {
                    this._logger.Warn(` [Templates]   Overwriting converter '${newOne.displayName ?? newOne.name}' with a new one`);

                    Object.assign(existing, newOne);
                }
            } else {
                // New one, so simply add it into the array
                this._finalTemplates.converters?.push(newOne);
                this._logger.Info(` [Templates]   Found new converter '${newOne.displayName ?? newOne.name}'`);
            }
        });
    }

    private mergeTasks(tasks: LibraryTask[]) {
        tasks.forEach(task => {
            const newOne = Object.assign({}, LibraryTaskDefaults, task);

            // Check if there is another with the same name
            const existing = (this._finalTemplates.tasks ?? []).find(c => c.name === newOne.name);
            if (existing != null) {
                const existingJson = JSON.stringify(existing);
                const newOneJson = JSON.stringify(newOne);
                if (existingJson !== newOneJson) {
                    this._logger.Warn(` [Templates]   Overwriting task '${newOne.displayName ?? newOne.name}' with a new one`);

                    Object.assign(existing, newOne);
                }
            } else {
                // New one, so simply add it into the array
                this._finalTemplates.tasks?.push(newOne);
                this._logger.Info(` [Templates]   Found new task '${newOne.displayName ?? newOne.name}'`);
            }
        });
    }
}