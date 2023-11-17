import { ConnectIoTGenerator, ValueType } from "../base";

class GeneratorTasksPackage extends ConnectIoTGenerator {

    private values: any = {
        directory: "controller-engine-custom-tasks",
        packageName: "@criticalmanufacturing/connect-iot-controller-engine-custom-tasks",
        packageVersion: "10.2.0",
        identifier: "MyTasksLibrary",
        targetSystemVersion: "10.2.0",
        dependsOnScope: "[]",
        mandatoryForScope: "[]",
        dependsOnProtocol: "",
        mandatoryForProtocol: "",

        targetSystemVersionProcessed: "",
    };

    constructor(args: any, opts: any) {
        super(args, opts);
    }

    /** Will prompt the user about all settings */
    async prompting() {
        this.values.directory = await this.askScalar("What is the directory name?", ValueType.Text, this.values.directory);
        this.values.packageName = await this.askScalar("What is the full package name?", ValueType.Text, this.values.packageName);
        this.values.packageVersion = await this.askScalar("What is the package version?", ValueType.Text, this.values.packageVersion);
        this.values.identifier = await this.askScalar("What is the library name?", ValueType.Text, this.values.identifier);
        this.values.targetSystemVersion = await this.askScalar("What is the target system (MES) version", ValueType.Text, this.values.targetSystemVersion);

        this.values.dependsOnScope = JSON.stringify(await this.askMultipleChoices("On which scopes this library can be used", ["ConnectIoT", "FactoryAutomation", "EnterpriseIntegration"], ["ConnectIoT", "FactoryAutomation", "EnterpriseIntegration"]));
        this.values.mandatoryForScope = JSON.stringify(await this.askMultipleChoices("On which scopes this library is *mandatory* (selected by default)", ["ConnectIoT", "FactoryAutomation", "EnterpriseIntegration"], []));
        this.values.dependsOnProtocol = await this.askScalar("Is this library specific for any protocol? If so, list the names separated ny comma", ValueType.Text, this.values.dependsOnProtocol);
        this.values.mandatoryForProtocol = await this.askScalar("Is this library *mandatory* for any protocol? If so, list the names separated ny comma", ValueType.Text, this.values.dependsOnProtocol);


        // Post process values
        this.values.targetSystemVersionProcessed = `release-${this.values.targetSystemVersion.split(".").join("")}`; // release-1003
        this.values.dependsOnProtocol = (this.values.dependsOnProtocol.trim()) === "" ? "[]" : this.values.dependsOnProtocol = JSON.stringify(this.values.dependsOnProtocol.split(","));
        this.values.mandatoryForProtocol = (this.values.mandatoryForProtocol.trim()) === "" ? "[]" : this.values.mandatoryForProtocol = JSON.stringify(this.values.mandatoryForProtocol.split(","));
        
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

        let files: string[] = ["package.json", "README.md", "tsconfig.json", "tslint.json", "packConfig.json"];
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
    }

    install() {
    }

    end() {
    }
}

declare var module: any;
(module).exports = GeneratorTasksPackage;
