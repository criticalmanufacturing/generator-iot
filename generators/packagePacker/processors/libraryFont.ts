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

    public process(fontConfigPath: string, destination: string): void {
        fontConfigPath = this._paths.transform(fontConfigPath);

        this._logger.Info(` [Font] Processing library font in '${fontConfigPath}'`);
        const fontContent: any = io.readJSONSync(fontConfigPath);
        let json: any = io.readJSONSync(destination);

        if (json?.criticalManufacturing?.tasksLibrary != null) {
            let libraryMetadata: any = json.criticalManufacturing.tasksLibrary;
            libraryMetadata.metadata["font"] = fontContent;

            io.writeFileSync(destination, JSON.stringify(json, null, 2), "utf8");
        } else {
            this._logger.debug(`No Library Metadata, will skip font`);
        }
    }
}
