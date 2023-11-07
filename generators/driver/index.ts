import { ConnectIoTGenerator, ValueType } from "../base";

class DriverConfig extends ConnectIoTGenerator {

    private values: any = {
        directory: "driver-sample",
        packageName: "@criticalmanufacturing/connect-iot-driver-sample",
        packageVersion: "10.2.0",
        identifier: "Sample",
        identifierCamel: "",
        hasCommands: true
    };

    constructor(args: any, opts: any) {
        super(args, opts);
    }

    /** Will prompt the user about all settings */
    async prompting() {
        this.values.directory = await this.askScalar("What is the identifier (directory name)?", ValueType.Text, this.values.directory);
        this.values.packageName = await this.askScalar("What is the full package name?", ValueType.Text, this.values.packageName);
        this.values.packageVersion = await this.askScalar("What is the package version?", ValueType.Text, this.values.packageVersion);

        this.values.identifier = await this.askScalar("What is the identifier (Protocol name, no spaces)?", ValueType.Text, this.values.identifier);
        this.values.identifier = this.pascalCaseValue(this.values.identifier);
        this.values.identifierCamel = this.camelCaseValue(this.values.identifier);

        this.values.hasCommands = await this.askScalar("Does the protocol support commands?", ValueType.Confirm, this.values.hasCommands);
    }

    /** Copy all files to destination directory with the settings defined in the previous step */
    copyTemplates() {
        // Base files:
        let filesWithRename: Map<string, string> = new  Map<string, string>([
            ["_iot_.gitattributes", ".gitattributes"],
            ["_iot_.gitignore", ".gitignore"],
            ["_iot_.npmignore", ".npmignore"],
            ["_iot_.npmrc", ".npmrc"],
            ["_iot_.connect_iot_package_done", ".connect_iot_package_done"],
        ]);
        filesWithRename.forEach((value, key) => {
            this.fs.copyTpl(this.templatePath(key), this.destinationPath(this.values.directory, value), this.values);
        });

        let files: string[] = ["package.json", "README.md", "tsconfig.json", "tslint.json", "gulpfile.js", "packConfig.json"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath(template), this.destinationPath(this.values.directory, template), this.values);
        });

         // Visual Studio settings
         files = ["settings.json", "launch.json"];
         files.forEach((template) => {
             this.fs.copyTpl(this.templatePath("_iot_.vscode", template), this.destinationPath(this.values.directory, ".vscode", template), this.values);
         });

        // Driver implementation classes
        files = ["index.ts", "types.ts", "inversify.config.ts", "communicationSettings.ts", "driverImplementation.ts"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath("src", template), this.destinationPath(this.values.directory, "src", template), this.values);
        });

        // Extended data classes
        files = ["index.ts", "property.ts", "event.ts", "eventProperty.ts", "command.ts", "commandParameters.ts"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath("src", "extendedData", template), this.destinationPath(this.values.directory, "src", "extendedData", template), this.values);
        });

        // Tests
        files = ["connection.test.ts"];
        files.forEach((template) => {
            this.fs.copyTpl(this.templatePath("test", "integration", template), this.destinationPath(this.values.directory, "test", "integration", template), this.values);
        });
    }

    install() {
    }

    end() {
    }
}

declare var module: any;
(module).exports = DriverConfig;
