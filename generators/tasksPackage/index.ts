import { ConnectIoTGenerator, ValueType } from "../base";
import * as path from "path";

class GeneratorTasksPackage extends ConnectIoTGenerator {

    private values: any = {
        directory: "controller-engine-custom-tasks",
        packageName: "@criticalmanufacturing/connect-iot-controller-engine-custom-tasks",
        packageVersion: "6.4.0",
    };

    constructor(args: any, opts: any) {
        super(args, opts);
    }

    /** Will prompt the user about all settings */
    async prompting() {
        this.values.directory = await this.askScalar("What is the identifier (directory name)?", ValueType.Text, this.values.directory);
        this.values.packageName = await this.askScalar("What is the full package name?", ValueType.Text, this.values.packageName);
        this.values.packageVersion = await this.askScalar("What is the package version?", ValueType.Text, this.values.packageVersion);
    }

    /** Copy all files to destination directory with the settings defined in the previous step */
    copyTemplates() {
        // Base files:
        let filesWithRename: Map<string, string> = new  Map<string, string>([
            ["_iot_.gitattributes", ".gitattributes"],
            ["_iot_.gitignore", ".gitignore"],
            ["_iot_.npmignore", ".npmignore"],
            ["_iot_.npmrc", ".npmrc"]
        ]);
        filesWithRename.forEach((value, key) => {
            this.fs.copyTpl(this.templatePath(key), this.destinationPath(this.values.directory, value), this.values);
        });

        let files: string[] = ["package.json", "README.md", "tsconfig.json", "tslint.json", "gulpfile.js"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath(template), this.destinationPath(this.values.directory, template), this.values);
        });

        // Visual Studio settings
        files = ["settings.json"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath("_iot_.vscode", template), this.destinationPath(this.values.directory, ".vscode", template), this.values);
        });

        // Package implementation classes
        files = ["metadata.ts"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath("src", template), this.destinationPath(this.values.directory, "src", template), this.values);
        });

        // Tests
        files = ["tsconfig.json", "dummy.test.ts"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath("test", "unit", template), this.destinationPath(this.values.directory, "test", "unit", template), this.values);
        });

        // We also need to update the root's .dev-tasks.js so this new package is included in the global install and build tasks
        const possiblePaths = [".dev-tasks.json", path.join("..", ".dev-tasks.json")];
        let filePath = possiblePaths.map(p => `${this.destinationPath(p)}`).find(p => this.fs.exists(p));

        if (filePath != null) {
            let fileContent = this.fs.readJSON(this.destinationPath(filePath));
            if (fileContent.packages.indexOf(this.values.directory) < 0) {
            fileContent.packages.push(this.values.directory);  
            }
            this.fs.writeJSON(filePath, fileContent);  
        }
    }

    install() {
    }

    end() {
    }
}

declare var module: any;
(module).exports = GeneratorTasksPackage;
