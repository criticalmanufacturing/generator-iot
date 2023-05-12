import { JsonTemplate, JsonTemplateCommand, JsonTemplateCommandDefaults, JsonTemplateCommandParameterDefaults, JsonTemplateEvent, JsonTemplateEventDefaults, JsonTemplateEventPropertyDefaults, JsonTemplateProperty, JsonTemplatePropertyDefaults, Template, TemplateType } from "../models/template";
import { Log } from "./log";
import * as io from "fs-extra";
import * as path from "path";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { Paths } from "./paths";

@injectable()
export class TemplatesProcessor {

    @inject(TYPES.Logger)
    private _logger: Log;
    @inject(TYPES.Paths)
    private _paths: Paths;

    private _finalTemplates: JsonTemplate = {};

    public process(templateRules: string | Template[], destination: string): void {
        let json: any = io.readJSONSync(destination);
        let automationProtocol: any = json.criticalManufacturing.automationProtocol;

        this._finalTemplates = automationProtocol.templates ?? { };
        if (this._finalTemplates != null && (this._finalTemplates.property != null || this._finalTemplates.event != null)) {
            this._logger.Warn(" [Templates] Existing templates found in the package.json file found. Merging the new ones with the existing");
        }

        // Prepare the initial object
        this._finalTemplates.property = this._finalTemplates.property ?? [];
        this._finalTemplates.event = this._finalTemplates.event ?? [];
        this._finalTemplates.command = this._finalTemplates.command ?? [];

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

        automationProtocol.templates = this._finalTemplates;
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

        const newTemplates: JsonTemplate = io.readJSONSync(templateFile);
        if (newTemplates != null) {
            this.mergeProperties(newTemplates.property ?? []);
            this.mergeEvents(newTemplates.event ?? []);
            this.mergeCommands(newTemplates.command ?? []);
        }
    }

    private mergeProperties(properties: JsonTemplateProperty[]) {
        properties.forEach(property => {
            const newOne = Object.assign({}, JsonTemplatePropertyDefaults, property);

            // Check if there is another with the same name
            const existing = (this._finalTemplates.property ?? []).find(p => p.Name === property.Name);
            if (existing != null) {
                const existingJson = JSON.stringify(existing);
                const newOneJson = JSON.stringify(newOne);
                if (existingJson !== newOneJson) {
                    this._logger.Warn(` [Templates]   Overwriting property '${property.Name}' with a new one`);

                    Object.assign(existing, newOne);
                }
            } else {
                // New one, so simply add it into the array
                this._finalTemplates.property?.push(newOne);
                this._logger.Info(` [Templates]   Found new property '${newOne.Name}'`);
            }
        });
    }

    private mergeEvents(events: JsonTemplateEvent[]) {
        events.forEach(event => {
            const newOne = Object.assign({}, JsonTemplateEventDefaults, event);
            for (let i = 0; i < (newOne.EventProperties ?? []).length; i++) {
                (newOne.EventProperties ?? [])[i] = Object.assign({}, JsonTemplateEventPropertyDefaults, (newOne.EventProperties ?? [])[i]);

                // Fix order if needed
                if ((newOne.EventProperties ?? [])[i].Order === -1) {
                    (newOne.EventProperties ?? [])[i].Order = i + 1;
                }
            }

            let validateEvent: boolean = false;

            // Check if there is another with the same name
            const existing = (this._finalTemplates.event ?? []).find(p => p.Name === event.Name);
            if (existing != null) {
                const existingJson = JSON.stringify(existing);
                const newOneJson = JSON.stringify(newOne);
                if (existingJson !== newOneJson) {
                    this._logger.Warn(` [Templates]   Overwriting event '${event.Name}' with a new one`);

                    Object.assign(existing, newOne);
                    validateEvent = true;
                }
            } else {
                // New one, so simply add it into the array
                this._finalTemplates.event?.push(newOne);
                this._logger.Info(` [Templates]   Found new event '${newOne.Name}'`);
                validateEvent = true;
            }

            if (validateEvent) {
                for (let property of newOne.EventProperties ?? []) {
                    if ((this._finalTemplates.property ?? []).find(p => p.Name === property.Property) == null) {
                        this._logger.Error(` [Templates]   Event '${event.Name}' has a reference to the unknown property '${property.Property}'`);
                    }
                }
            }
        });
    }

    private mergeCommands(commands: JsonTemplateCommand[]) {
        commands.forEach(command => {
            const newOne = Object.assign({}, JsonTemplateCommandDefaults, command);
            for (let i = 0; i < (newOne.CommandParameters ?? []).length; i++) {
                (newOne.CommandParameters ?? [])[i] = Object.assign({}, JsonTemplateCommandParameterDefaults, (newOne.CommandParameters ?? [])[i]);

                // Fix order if needed
                if ((newOne.CommandParameters ?? [])[i].Order === -1) {
                    (newOne.CommandParameters ?? [])[i].Order = i + 1;
                }
            }

            // Check if there is another with the same name
            const existing = (this._finalTemplates.command ?? []).find(p => p.Name === command.Name);
            if (existing != null) {
                const existingJson = JSON.stringify(existing);
                const newOneJson = JSON.stringify(newOne);
                if (existingJson !== newOneJson) {
                    this._logger.Warn(` [Templates]   Overwriting command '${command.Name}' with a new one`);

                    Object.assign(existing, newOne);
                }
            } else {
                // New one, so simply add it into the array
                this._finalTemplates.command?.push(newOne);
                this._logger.Info(` [Templates]   Found new command '${newOne.Name}'`);
            }
        });
    }
}