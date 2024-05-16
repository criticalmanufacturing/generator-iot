import { container } from "./inversify.config";
import { spawnSync } from "child_process";
import * as io from "fs-extra";
import * as path from "path";
import { Configuration, Action, ActionType, Addon, ComponentType } from "./configuration";
const ncc = require("@vercel/ncc");
import { DriverTemplatesProcessor } from "./processors/driverTemplates";
import { LibraryTemplatesProcessor } from "./processors/libraryTemplates";
import { TYPES } from "./types";
import { Paths } from "./processors/paths";
import { Log } from "./processors/log";
import { ShrinkwrapGenerator } from "./processors/shrinkwrapGenerator";
import { LibraryFontProcessor } from "./processors/libraryFont";
import { log } from "console";

export class PackagePacker {
    

    public async go(options: { [name: string]: any }) {

        const source: string = <string>options.i || <string>options.input || process.cwd();
        const destination: string = <string>options.o || <string>options.output || "";
        let temp: string = <string>options.t || <string>options.temp || `${source}\\__TEMP__`;
        const configurationFile: string = <string>options.c || <string>options.config || `${source}\\packConfig.json`;
        const addons: string = <string>options.a || <string>options.addons;
        const version: string = <string>options.v || <string>options.version || "";
        const debug: boolean = <boolean>options.d || <boolean>options.debug || false;
        // let mappedAddons: string | undefined = undefined;

        const _logger: Log = container.get<Log>(TYPES.Logger);

        console.log(`Using the following settings:`);
        console.log(`   Source        : ${source}`);
        console.log(`   Destination   : ${destination}`);
        console.log(`   Temporary     : ${temp}`);
        console.log(`   Configuration : ${configurationFile}`);
        console.log(`   Addons        : ${addons}`);
        console.log(`   Version       : ${version}`);
        console.log(`   Debug Mode    : ${debug}`);
        console.log();

        // Sanity checks
        if (!io.existsSync(source)) {
            console.error("\x1b[31m", `Source directory '${source}' doesn't exist!`, "\x1b[0m");
            process.exit(1);
        }

        if (!io.existsSync(configurationFile)) {
            console.warn("\x1b[33m", `Configuration file '${configurationFile}' doesn't exist!`, "\x1b[0m");
            console.warn("\x1b[33m", `This package will not packed!`, "\x1b[0m");
            process.exit(0);
        }

        if (addons != null && addons !== "" && !io.existsSync(addons)) {
            console.error("\x1b[31m", `Addons location '${addons}' doesn't exist!`, "\x1b[0m");
            process.exit(1);
        }

        // JS: No longer need - Node already supports UNCs
        // Network drive for the addons=Map + mklink
        // if (addons.startsWith("\\\\")) {
        //     this.run("net", [ "use", addons]);
        //     mappedAddons = path.join(os.tmpdir(), uuid.v4());

        //     const command = `mklink /d "${mappedAddons}" "${addons}"`;
        //     const output = childProcess.execSync(command).toString().trim();
        //     console.log(output);

        //     console.log(`   Addons (map)  : ${mappedAddons}`);
        // }

        const paths = container.get<Paths>(TYPES.Paths);
        paths.setup(source, destination, temp, addons);

        // Monkey patch the ncc to allow parsing package.json files with unicode starting values
        // This will only perform once, but attempted every time
        // this.replaceTextInFile(path.resolve(__dirname, "..", "node_modules", "@zeit", "ncc", "dist", "ncc", "index.js.cache.js"), "r=JSON.parse(n.toString(\"utf-8\"))", "r=JSON.parse(n.toString(\"utf-8\").trim())", false);


        const configuration: Configuration = JSON.parse(io.readFileSync(configurationFile, "utf8"));

        // Prepare temp Directory
        if (configuration.type === ComponentType.TasksPackage) {
            temp = io.readJSONSync(path.join(source, "ng-package.json")).dest;

            if (!io.existsSync(temp)) {
                console.error("\x1b[31m", `'${temp}' doesn't exist! Did you forget to run 'ng build'?`, "\x1b[0m");
                process.exit(1);
            }
        } else {
            this.deleteDirectory(temp);
            this.createDirectory(temp);
        }

        if (configuration.type === ComponentType.TasksLibrary) {
            // Tasks packages don't export anything
            this.generateTasksPackageExportFile(path.join(source, "src", "metadata.js"), path.join(source, "src", "index.js"));
        }

        // Pack package
        const packs = configuration.packs || [];
        if (packs.length === 0) {
            if (configuration.type === ComponentType.TasksPackage) {
                packs.push({
                    directory: "src",
                    source: "public-api-runtime.js",
                    destination: "index.js",
                });
            } else {
                packs.push({
                    directory: "src",
                    source: "index.js",
                    destination: "index.js",
                });
            }
        }

        for (const pack of packs) {
            // await packPackage(path.join(source, "src"), "index.js", temp, "index.js");
            await this.packPackage(
                path.join(source, pack.directory),
                pack.source || "index.js",
                temp,
                pack.destination || "index.js");
        }

        if (configuration.type !== ComponentType.TasksPackage) {
            // Copy necessary files to generate package

            if (!io.existsSync("npm-shrinkwrap.json")) {
                _logger.Warn("npm-shrinkwrap.json file not found. Trying to generate it...");
                container.get<ShrinkwrapGenerator>(TYPES.Processors.ShrinkwrapGenerator).process(source, "npm-shrinkwrap.json");
                this.copyFile("npm-shrinkwrap.json", source, temp);
            } else {
                this.copyFile("npm-shrinkwrap.json", source, temp);
            }
            this.copyFile(".npmignore", source, temp);
            this.copyFile(".npmrc", source, temp);
            this.copyFile("README.md", source, temp);
            this.copyFile("package.json", source, temp);
        }

        if (configuration.type === ComponentType.TasksPackage) {
            this.deleteFile(path.join(source, "src", "index.js"));
        }

        this.setPackageJsonAsPacked(path.join(temp, "package.json"));
        if (version != null && version !== "") {
            this.changePackageJsonVersion(path.join(temp, "package.json"), version);
        }

        // TasksPackages must have the dependencies for the GUI. All others, clear them
        if (configuration.type !== ComponentType.TasksPackage) {
            this.removeDependenciesFromPackageJson(path.join(temp, "package.json"));
        }

        // Copy .node files (Addons)
        (configuration.addons || []).forEach((addon: Addon) => {
            const sourceAddonDir: string = path.join(/*mappedAddons ||*/ addons, addon.name, addon.version);
            const destinationAddonDir: string = path.join(temp, "addons", addon.name);
            this.createDirectory(path.join(temp, "addons"));
            this.createDirectory(destinationAddonDir);

            for (let addonFile of this.findByExtension(sourceAddonDir, addon.fileMask)) {
                this.copyFile(addonFile, sourceAddonDir, destinationAddonDir);
            }
        });

        // Process any template action
        if (configuration.templates != null) {
            const destination = path.join(temp, "package.json");

            switch (configuration.type) {
                case ComponentType.Component: 
                    container.get<DriverTemplatesProcessor>(TYPES.Processors.DriverTemplates).process(configuration.templates, destination);
                    break;
                case ComponentType.TasksPackage:
                case ComponentType.TasksLibrary:
                    await container.get<LibraryTemplatesProcessor>(TYPES.Processors.LibraryTemplates).process(configuration.templates, destination);
                    break;
            }
        }

         // Process any font action
         if (configuration.font != null) {
            const destination = path.join(temp, "package.json");

            if (configuration.type === ComponentType.TasksLibrary) {
                container.get<LibraryFontProcessor>(TYPES.Processors.LibraryFontProcessor).process(configuration.font, destination);
            }
        }

        // process Post actions
        (configuration.postActions || []).forEach((action: Action) => {
            const actionSource: string = (action.source || "")
                .replace("${Source}", source)
                .replace("${Temp}", temp)
                .replace("${Destination}", destination)
                .replace("${Addons}", addons);

            const actionDestination: string = (action.destination || "")
                .replace("${Source}", source)
                .replace("${Temp}", temp)
                .replace("${Destination}", destination)
                .replace("${Addons}", addons);

            switch (action.type) {
                case ActionType.DeleteFile: this.deleteFile (actionSource); break;
                case ActionType.DeleteDirectory: this.deleteDirectory (actionSource); break;
                case ActionType.CopyDirectory: this.copyDirectory (actionSource, actionDestination); break;
                case ActionType.CopyFile: this.copyFile (action.file || "", actionSource, actionDestination); break;
                case ActionType.MoveFile: this.moveFile (action.file || "", actionSource, actionDestination); break;
                case ActionType.RenameFile: this.renameFile(actionSource, actionDestination); break;
                case ActionType.ReplaceText: this.replaceTextInFile(actionSource, action.search || "", action.replace || "", action.isRegularExpression || false); break;
            }
        });


        // Place index.js into src directory
        this.createDirectory(path.join(temp, "src"));
        if (configuration.type === ComponentType.TasksPackage) {
            this.moveFile("index.js", temp, path.join(temp, "src"));
        } else {
            for (const pack of packs) {
                // Fix issue with nconf
                // https://github.com/zeit/ncc/issues/451
                ["argv", "env", "file", "literal", "memory"].forEach((toFix: string) => {
                    this.replaceTextInFile(path.join(temp, pack.destination || "index.js"), `arg === \"${toFix}.js\"`, `arg === \"${toFix}\"`, false);
                });

                this.moveFile(pack.destination || "index.js", temp, path.join(temp, "src"));
            }
        }

        // Create Package and place it in the destination
        if (destination !== "") {
            this.createDirectory(destination);
            this.run ("npm.cmd", [ "pack" ], temp);
            for (let packedPackage of this.findByExtension(temp, "*.tgz")) {
                this.moveFile(packedPackage, temp, destination);
            }
        }


        // Delete temp
        if (debug === false) {
            this.deleteDirectory(temp);
        } else {
            console.warn("\x1b[33m", `Directory '${temp}' was *NOT* deleted`, "\x1b[0m");
        }

        console.log("");
        console.log("\x1b[32m", "** Finished **", "\x1b[0m");
    }

    /**
     * Delete a file
     * @param filePath Path of the file
     */
    private deleteFile(filePath: string): void {
        if (io.existsSync(filePath)) {
            io.unlinkSync(filePath);
            console.info(`  [Deleted] '${filePath}'`);
        } else {
            console.warn(`  [Ignored] '${filePath}'`);
        }
    }

    /**
     * Delete an entire directory, even if it is not empty
     * @param directoryPath Full path of the directory to delete
     */
    private deleteDirectory(directoryPath: string): void {
        if (io.existsSync(directoryPath)) {
            io.removeSync(directoryPath);
            console.info(`  [Deleted] '${directoryPath}'`);
        } else {
            console.warn(`  [Ignored] '${directoryPath}'`);
        }
    }

    /**
     * Create a new Directory
     * @param directoryPath Full path of the directory to create
     */
    private createDirectory(directoryPath: string): void {
        if (io.existsSync(directoryPath)) {
            console.warn(`  [Ignored] '${directoryPath}'`);
        } else {
            io.mkdirSync(directoryPath, 0o777);
            console.info(`  [Created] '${directoryPath}'`);
        }
    }

    /**
     * Copy one file from one place to another
     * @param file Name of the file
     * @param source Directory path where the file is located
     * @param destination Directory path where the file is to be copied
     */
    private copyFile(file: string, source: string, destination: string): void {
        const sourcePath: string = path.join(source, file);
        const destinationPath: string = path.join(destination, file);

        if (io.existsSync(sourcePath)) {
            io.ensureDirSync(destination);
            io.copySync(sourcePath, destinationPath);
            console.info(`  [Copy] '${file}' to '${destination}'`);
        } else {
            console.error("\x1b[31m", ` [FAIL] File '${sourcePath}' doesn't exist!!!`, "\x1b[0m");
        }
    }

    /**
     * Move a file from one location into another
     * @param file File to move
     * @param source Directory path where the file is located
     * @param destination Directory path where the file is to be moved
     */
    private moveFile(file: string, source: string, destination: string): void {
        const sourcePath: string = path.join(source, file);
        const destinationPath: string = path.join(destination, file);

        if (io.existsSync(sourcePath)) {
            io.ensureDirSync(destination);
            io.copySync(sourcePath, destinationPath);
            io.unlinkSync(sourcePath);
            console.info(`  [Move] '${file}' from '${source}' to '${destination}'`);
        } else {
            console.error("\x1b[31m", ` [FAIL] File '${sourcePath}' doesn't exist!!!`, "\x1b[0m");
        }
    }

    /**
     * Rename an existing file
     * @param source Full path of the original file
     * @param destination Full path of the destination file
     */
    private renameFile(source: string, destination: string): void {
        if (io.existsSync(source)) {
            io.moveSync(source, destination);
            console.info(`  [Rename] '${source}' to '${destination}'`);
        } else {
            console.error("\x1b[31m", ` [FAIL] File '${source}' doesn't exist!!!`, "\x1b[0m");
        }
    }

    private createFile(destination: string, contents: Buffer): void {
        const baseDirectory = path.dirname(destination);
        io.ensureDirSync(baseDirectory);
        io.writeFileSync(destination, contents, "utf8");
    }

    /**
     * Copy entire directory from one place to another
     * @param source Full path of the original directory
     * @param destination Full path of the destination directory
     */
    private copyDirectory = function (source: string, destination: string): void {
        if (io.existsSync(source)) {
            io.copySync(source, destination, {
                // recursive: true,
                overwrite: true,
                preserveTimestamps: true,
            });
            console.info(`  [CopyDirectory] '${source}' to '${destination}'`);
        } else {
            console.error("\x1b[31m", ` [FAIL] Directory '${source}' doesn't exist!!!`, "\x1b[0m");
        }
    }


    /**
     * Replaces a text from a file with another text
     * @param file Full path of the file
     * @param search Token to search
     * @param replace Token to replace
     */
    private replaceTextInFile(file: string, search: string, replace: string, isRegularExpression: boolean): void {
        if (io.existsSync(file) || search === "") {
            let contents = io.readFileSync(file, "utf8");
            let wasChanged: boolean = false;
            if (isRegularExpression === false) {
                let iPos = contents.indexOf(search);
                while (iPos > 0) {
                    console.info(`  [Replaced] '${search}' with '${replace}'`);
                    contents = contents.replace(search, replace);
                    wasChanged = true;
                    iPos = contents.indexOf(search);
                }
            } else {
                const previous = contents;
                contents = contents.replace(new RegExp(search, "g"), replace);
                wasChanged = contents !== previous;
                if (wasChanged) {
                    console.info(`  [Replaced] '${search}' with '${replace}'`);
                }
            }

            if (wasChanged) {
                io.writeFileSync(file, contents, "utf8");
            }

        } else {
            console.error("\x1b[33m", `  [IGNORED] ReplaceText in '${file}' because it doesn't exist!!!`, "\x1b[0m");
        }
    }

    /**
     * Run an external application
     * @param command Command to execute
     * @param args Arguments to pass to the command
     * @param cwd Directory where the command will run
     */
    private run(command: string, args: string[], cwd?: string): boolean {
        console.info(`  [Run] ${cwd != null ? cwd + "> " : ""}${command} ${args.join(" ")}`);
        const child = spawnSync(command, args, {
            cwd: cwd
        });

        if (child.error != null) {
            console.error("\x1b[31m", child.error, "\x1b[0m");
        }

        if (child.stderr) {
            console.warn("\x1b[33m", child.stderr.toString(), "\x1b[0m");
        }

        if (child.stdout != null) {
            console.log(child.stdout.toString());
        }

        return (true);
    }

    /**
     * Remove from package.json all dependencies and dev dependencies
     * @param file Full path of the package.json file
     */
    private removeDependenciesFromPackageJson(file: string): void {
        const contents = JSON.parse(io.readFileSync(file, "utf8"));
        contents.scripts = {};
        contents.dependencies = {};
        contents.devDependencies = {};
        if (contents.cmfLinkDependencies != null) {
            contents.cmfLinkDependencies = undefined;
        }
        io.writeFileSync(file, JSON.stringify(contents, null, 2), "utf8");
        console.info(`  [Stripped] '${file}'`);
    }

    /**
     * Patch publish script to have an "Upper level" path
     * @param file Full path of the package.json file
     */
    private patchPublishScriptFromPackageJson(file: string): void {
        const contents = JSON.parse(io.readFileSync(file, "utf8"));
        if (contents.scripts != null && contents.scripts.publish != null) {
            if (contents.scripts.publish.indexOf(" ../../scripts") !== -1) {
                contents.scripts.publish = contents.scripts.publish.replace(" ../../scripts", " ../../../scripts");
            }
        }

        io.writeFileSync(file, JSON.stringify(contents, null, 2), "utf8");
        console.info(`  [Patched] '${file}'`);
    }

    /**
     * Change the version stated in a package.json file
     * @param file Full path of the package.json file
     * @param version Version to change to
     */
    private changePackageJsonVersion(file: string, version: string): void {
        const contents = JSON.parse(io.readFileSync(file, "utf8"));
        contents.version = version;
        io.writeFileSync(file, JSON.stringify(contents, null, 2), "utf8");
        console.info(`  [NewVersion] '${file}' (${version})`);
    }

    private setPackageJsonAsPacked(file: string): void {
        const contents = JSON.parse(io.readFileSync(file, "utf8"));
        if (contents.criticalManufacturing == null) {
            contents.criticalManufacturing = { };
        }
        contents.criticalManufacturing.isPacked = true;
        io.writeFileSync(file, JSON.stringify(contents, null, 2), "utf8");
        console.info(`  [IsPacked] '${file}' (true)`);
    }

    /**
     * Retrieves a list of files that math a glob
     * @param searchPath Full path to search
     * @param extension Glob expression
     */
    private findByExtension(searchPath: string, extension: string, basePath?: string): string | string[] {
        if (extension.startsWith("*.")) {
            extension = extension.substring(1);
        }
    
        basePath = basePath ?? "";
    
        const result: string[] = [];
    
        const files = io.readdirSync(searchPath);
        for (let i = 0; i < files.length; i++) {
            const filename = path.join(searchPath, files[i]);
            const stat = io.lstatSync(filename);
    
            if (stat.isDirectory()) {
                result.push(...this.findByExtension(filename, extension, basePath + `/${path.basename(filename)}`));
            } else if (filename.endsWith(extension) || extension === "*") {
                result.push(path.join(basePath, path.basename(filename)));
            }
        }
    
        return (result);
    
    }

    /**
     * Retrieve the list of strings that are present between two tokens
     * @param contents Full text (will be split by \r\n)
     * @param startToken Token that identifies the beginning
     * @param endToken Token that identifies the end
     */
    private linesBetweenTokens(contents: string, startToken: string, endToken: string): string[] {
        let fileContent = contents.split("\n");
        let startIndex = -1;
        let endIndex = -1;

        fileContent.forEach((line, index) => {
            if (startIndex === -1 && line.trim().toLocaleLowerCase().includes(startToken.trim().toLocaleLowerCase())) {
                startIndex = index;
            }
            if (endIndex === -1 && startIndex !== -1 && line.trim().toLocaleLowerCase().includes(endToken.trim().toLocaleLowerCase())) {
                endIndex = index;
            }
        });

        if (startIndex !== -1 && endIndex !== -1) {
            // confirm prefix tabs
            if (startIndex !== endIndex) {
                fileContent.splice(endIndex + 1);
                fileContent.splice(0, startIndex);

                return (fileContent);
            }
        }

        return ([]);
    }

    /**
     * Generate a file that will export all tasks and converters from a metadata file
     * @param metadataFile Full path of the metadata file
     * @param destination Full path of the generated file
     */
    private generateTasksPackageExportFile(metadataFile: string, destination: string): void {
        let resultFileContent = `
        "use strict";

        /** Auto Generated by PackagePacker */
        Object.defineProperty(exports, "__esModule", { value: true });

        /** Metadata */
        var Metadata = require("./metadata");
        exports.Metadata = Metadata;

        /** Tasks */`;
        const contents = io.readFileSync(metadataFile, "utf8");

        // Tasks
        const tasks = this.linesBetweenTokens(contents, "tasks:", "]");

        let isObject = false;
        let objectName: string = "";
        let objectIndexFile: string = "";

        for (const task of tasks) {
            const value: string = task.trim();
            if (!value.startsWith ("tasks:") && !value.startsWith("]") && value !== "" && !value.startsWith ("//")) {
                if (value.startsWith("{")) {
                    isObject = true;
                }

                if (isObject && value.startsWith("name:")) {
                    objectName = value.substring(value.indexOf("\"") + 1, value.lastIndexOf("\""));
                    objectIndexFile = "index";
                } else if (!isObject && !value.startsWith("}")) {
                    let taskName = value.substring(value.indexOf("\"") + 1, value.lastIndexOf("\""));
                    resultFileContent +=
    `
        var task_${taskName} = require("./tasks/${taskName}/index");
        exports.task_${taskName} = task_${taskName};
    `;
                } else if (isObject && value.startsWith("\"NodeJS\":")) {
                    objectIndexFile = value.substring(value.indexOf(": \"") + 3, value.lastIndexOf("\""));
                }

                if (isObject && value.startsWith("}")) {
                    isObject = false;
                    resultFileContent +=
    `
        var task_${objectName} = require("./tasks/${objectName}/${objectIndexFile}");
        exports.task_${objectName} = task_${objectName};
    `;
                }
            }

        }

        resultFileContent += `\r\n
        /** Converters */`;

        // Converters
        const converters = this.linesBetweenTokens(contents, "converters:", "]");

        for (const converter of converters) {
            const value: string = converter.trim();
            if (!value.startsWith ("converters:") && !value.startsWith("]") && value !== "" && !value.startsWith ("//")) {
                let converterName = value.substring(value.indexOf("\"") + 1, value.lastIndexOf("\""));
                resultFileContent +=
    `
        var converter_${converterName} = require("./converters/${converterName}/index");
        exports.converter_${converterName} = converter_${converterName};
    `;
            }

        }

        io.writeFileSync(destination, resultFileContent + "\r\n", "utf8");
        console.info(`  [NewFile] '${destination})`);
    }

    /**
     * Execute ncc over a selected file to bundle it
     * @param SourceDirectory Directory where the file is
     * @param sourceFile name of the file to bundle
     * @param destinationDirectory Destination where to save the result
     * @param destinationFile Name of the final bundled file
     */
    private async packPackage(SourceDirectory: string, sourceFile: string, destinationDirectory: string, destinationFile: string): Promise<void> {
        const nccInput: string = path.join(SourceDirectory, sourceFile);
        const nccOptions: any = { minify: false, sourceMap: false, sourceMapRegister: false, quiet: true };
        const { code, map, assets } = await ncc(nccInput, nccOptions);

        for (let [assetName, assetCode] of Object.entries(assets)) {
            const assetSize = Math.round(
                Buffer.byteLength((<Buffer>(<any>assetCode).source), "utf8") / 1024
            );

            this.createFile(path.join(destinationDirectory, assetName), (<Buffer>(<any>assetCode).source));
            console.log(`  [PACKING] ${assetSize}Kb \t ${assetName} `);
        }

        await this.sleep(5000);

        const codeSize = Math.round(Buffer.byteLength(code, "utf8") / 1024);
        // const mapSize = map ? Math.round(Buffer.byteLength(map, "utf8") / 1024) : 0;

        this.createFile(path.join(destinationDirectory, destinationFile), code);
        console.log("\x1b[32m", ` [PACK RESULT] ${codeSize}Kb \t ${destinationFile}`, "\x1b[0m");
    }

    /**
     * Sleep for a moment before continuing to the next instruction
     * @param ms Number of milliseconds to sleep
     */
    private sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
