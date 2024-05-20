import { Template, TemplateType } from "../models/template";
import { LibraryConverter, LibraryConverterDefaults, LibraryMetadata, LibraryTask, LibraryTaskDefaults } from "../models/library";

import { Log } from "./log";
import * as io from "fs-extra";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { Paths } from "./paths";

@injectable()
export class LibraryFontProcessor {

    @inject(TYPES.Logger)
    private _logger: Log;
    @inject(TYPES.Paths)
    private _paths: Paths;

    private _finalTemplates: LibraryMetadata = {};

    public process(fontConfigPath: string, destination: string): void {
        fontConfigPath = this._paths.transform(fontConfigPath);

        this._logger.Info(` [Font] Processing library font in '${fontConfigPath}'`);
        const fontContent: any = io.readJSONSync(fontConfigPath);
        let json: any = io.readJSONSync(destination);
        
        if (json?.criticalManufacturing?.tasksLibrary == null) {
            throw new Error("Unable to read TasksLibrary section of the package.json file")
        }

        let libraryMetadata: any = json.criticalManufacturing.tasksLibrary;
        libraryMetadata.metadata["font"] = fontContent;

        io.writeFileSync(destination, JSON.stringify(json, null, 2), "utf8");
    }
}
