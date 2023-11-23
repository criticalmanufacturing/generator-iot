import { ConnectIoTGenerator, ValueType, IoTValueType } from "../base";
import { LibraryMetadata, LibraryTask, SettingsSetting, TaskInputType, TaskInputTypeType, TaskOutputType, TaskOutputTypeType } from "../packagePacker/models/library";

class GeneratorTask extends ConnectIoTGenerator {

    private values: any = {
        name: "blackBox", // camel case
        className: "", // pascal case
        title: "Black Box",
        icon: "",
        svg: "",
        isProtocol: false,
        isController: true,
        lifecycle: "Productive",
        lifecycleMessage: "",
        dependsOnProtocol: "",
        dependsOnScope: "",

        inputs: {
            "activate": {
                "type": "Activate",
                "dataType": "",
                "displayName": "Activate",
                "defaultValue": ""
            }        
        },
        outputs: {
            "success": {
                "type": "Success",
                "displayName": "Success",
            },
            "error": {
                "type": "Error",
                "displayName": "Error"
            }
        },
        settings: {
            "General": {
                "Example Section": [
                    {
                        "name": "Example",
                        "displayName": "Example Setting",
                        "settingKey": "example",
                        "dataType": "string",
                        "defaultValue": "Hello World",
                        "infoMessage": "Information about the example setting"
                    }
                ]
            }
        },

        inputsInterface: "",
        outputsInterface: "",
        settingsInterface: "",
        settingsDefaults: "",
        testSettingsDefaults: "",
    };
    private asking: boolean = false;

    constructor(args: any, opts: any) {
        super(args, opts);

        if (!this.fs.exists(this.destinationPath("package.json"))) {
            this.env.error(new Error("Unable to identify project location. Make sure you are running the command from the root directory (same as package.json)"));
        }
    }

    /**
     * Will prompt the user for task details
     */
    // https://www.npmjs.com/package/inquirer
    async prompting() {

        this.asking = true;
        // Basic information request
        this.values.name = this.camelCaseValue(await this.askScalar("What is task name?", ValueType.Text, this.values.name));
        this.values.title = await this.askScalar("What is the task title?", ValueType.Text, this.values.title);
        this.values.icon = await this.askScalar("What is the icon class name (leave empty to use svg instead)?", ValueType.Text, this.values.icon);
        if (this.values.icon === "") {
            this.values.svg = await this.askScalar("What is the svg data (value inside d=\"\")?", ValueType.Text, this.values.svg);
            if (this.values.svg === "") {
                // this.values.svg = "M981.333333 319.84v-0.36c0-0.32 0-0.666667-0.04-0.953333v-0.353334c-0.033333-0.373333-0.073333-0.753333-0.126666-1.12v-0.126666a20.56 20.56 0 0 0-0.56-2.666667v-0.08a21.213333 21.213333 0 0 0-1.506667-3.853333l-0.053333-0.093334c-0.24-0.473333-0.493333-0.933333-0.766667-1.38l-118.666667-197.626666a53.593333 53.593333 0 0 0-45.733333-25.893334H210.12a53.593333 53.593333 0 0 0-45.733333 25.893334L45.806667 308.86c-0.273333 0.446667-0.526667 0.9-0.766667 1.333333l-0.053333 0.106667a21.273333 21.273333 0 0 0-1.506667 3.84v0.086667a20.666667 20.666667 0 0 0-0.56 2.666666v0.133334c-0.053333 0.373333-0.093333 0.746667-0.126667 1.12v0.353333c0 0.32 0 0.633333-0.04 0.953333v565.853334a53.393333 53.393333 0 0 0 53.333334 53.333333H928a53.393333 53.393333 0 0 0 53.333333-53.333333V320v-0.16z m-158.3-186.666667L922.32 298.666667h-202.446667L668.666667 128h145.206666a10.72 10.72 0 0 1 9.153334 5.18zM341.333333 341.333333h341.333334v170.666667H341.333333z m282.793334-213.333333L675.333333 298.666667H348.666667l51.2-170.666667z m-423.153334 5.18a10.72 10.72 0 0 1 9.146667-5.18H355.333333l-51.2 170.666667H101.68zM938.666667 885.333333a10.666667 10.666667 0 0 1-10.666667 10.666667H96a10.666667 10.666667 0 0 1-10.666667-10.666667V341.333333h213.333334v192a21.333333 21.333333 0 0 0 21.333333 21.333334h384a21.333333 21.333333 0 0 0 21.333333-21.333334V341.333333h213.333334z m-128-96a21.333333 21.333333 0 0 1 21.333333-21.333333 21.333333 21.333333 0 1 1-21.333333 21.333333z m-64-21.333333a21.333333 21.333333 0 0 1 0 42.666667H618.666667a21.333333 21.333333 0 0 1 0-42.666667z";
                this.values.icon = "icon-core-tasks-connect-iot-lg-customlbo";
            }
        }

        this.values.isProtocol = await this.askScalar("Is this task used by the protocol driver?", ValueType.Confirm, this.values.isProtocol);
        if (this.values.isProtocol) {
            this.values.isController = false; // By default should not be for both
            this.values.isController = await this.askScalar("Will this task be also usable without the driver connection?", ValueType.Confirm, this.values.isController);
        }

        this.values.lifecycle = await this.askChoice("What is the lifecycle of the task", ["Productive", "Experimental", "Deprecated"], this.values.lifecycle);
        if (this.values.lifecycle !== "Productive") {
            this.values.lifecycleMessage = await this.askScalar("What message should the user see regarding lifecycle?", ValueType.Text, this.values.lifecycleMessage);
        }

        this.values.dependsOnProtocol = await this.askScalar("Is this task specific for any protocol? If so, list the names separated by comma", ValueType.Text, this.values.dependsOnProtocol);
        this.values.dependsOnScope = JSON.stringify(await this.askMultipleChoices("On which scopes this library can be used", ["ConnectIoT", "FactoryAutomation", "EnterpriseIntegration"], ["ConnectIoT", "FactoryAutomation", "EnterpriseIntegration"]));
        
        await this.handleInputs();
        await this.handleOutputs();
        await this.handleSettings();

        this.asking = false;

        // Values converted
        this.values.className = this.pascalCaseValue(this.values.name);
        this.values.dependsOnProtocol = (this.values.dependsOnProtocol.trim()) === "" ? "[]" : JSON.stringify(this.values.dependsOnProtocol.split(","));
    }

    // Inputs
    private async handleInputs(): Promise<void> {
        if (!this.asking) { return; } // Yo executes all methods from the class... This is an utility
        let choice = "";
        while ((choice = await this.askInputsChoice()) !== "Done") {
            // Create the list to be used with Remove and Edit
            const allInputs = ["**NONE**"];
            for (const inputName in this.values.inputs) {
                if (this.values.inputs.hasOwnProperty(inputName)) {
                    const input: TaskInputType | string = this.values.inputs[inputName];
                    if (typeof (input) === "string" || input.type === TaskInputTypeType.Static) {
                        allInputs.push(inputName);
                    }
                }
            }

            switch (choice) {
                case "Add":
                    const input: TaskInputType = {
                        type: TaskInputTypeType.Static,
                        dataType: "String",
                        defaultValue: "",
                        displayName: "",
                    };

                    const name = await this.askScalar("Input Name: ", ValueType.Text, "newInput");
                    input.displayName = await this.askScalar("Input Display Name: ", ValueType.Text, this.pascalCaseValue(name));
                    // input.type = <any>(await this.askChoice("Input Type: ", ["Static", "Activate"], input.type));
                    
                    if (input.type === TaskInputTypeType.Static) {
                        input.dataType = await this.askValueType("Input Data Type:", <any>input.dataType, false);
                        input.defaultValue = await this.askScalar("Input Default Value: ", ValueType.Text, input.defaultValue ?? "");
                    }
                    
                    if (input.type === TaskInputTypeType.Static && input.defaultValue === "" && input.displayName === name) {
                        this.values.inputs[name] = input.dataType;
                    } else {
                        this.values.inputs[name] = input;
                    }

                    break;
                case "Remove":
                    const inputToRemove = await this.askChoice("\Input to remove", allInputs, "");
                    if (inputToRemove !== "**NONE**") {
                        delete this.values.inputs[inputToRemove];
                    }
                    break;
                case "Edit":
                    const inputName = await this.askChoice("\Input to edit", allInputs, "");
                    if (inputName !== "**NONE**") {
                        const inputToEdit = this.values.inputs[inputName];
                        delete this.values.inputs[inputName];

                        let input: TaskInputType = {
                            type: TaskInputTypeType.Static,
                            dataType: "String",
                            defaultValue: "",
                            displayName: inputName,
                        };

                        if (typeof(inputToEdit) === "string") {
                            input.dataType = <any>inputToEdit;
                        } else {
                            input = inputToEdit;
                        }
    
                        const name = await this.askScalar("Input Name: ", ValueType.Text, inputName);
                        input.displayName = await this.askScalar("Input Display Name: ", ValueType.Text, input.displayName);
                        // input.type = <any>(await this.askChoice("Input Type: ", ["Static", "Activate"], input.type));
                        
                        if (input.type === TaskInputTypeType.Static) {
                            input.dataType = await this.askValueType("Input Data Type:", <any>input.dataType, false);
                            input.defaultValue = await this.askScalar("Input Default Value: ", ValueType.Text, input.defaultValue ?? "");
                        }
                        
                        if (input.type === TaskInputTypeType.Static && input.defaultValue === "" && input.displayName === name) {
                            this.values.inputs[name] = input.dataType;
                        } else {
                            this.values.inputs[name] = input;
                        }
                    }
                    break;
            }
        }
    }

    private async askInputsChoice(): Promise<string> {
        if (!this.asking) { return("") } // Yo executes all methods from the class... This is an utility

        console.log("");
        console.log("Current Inputs:");
        for (const inputName in this.values.inputs) {
            if (this.values.inputs.hasOwnProperty(inputName)) {
                const input: TaskInputType | string = this.values.inputs[inputName];

                if (typeof (input) === "string") {
                    console.log("\x1b[32m", `${inputName} -> ${inputName} (${input})`, "\x1b[0m");
                } else  if (input.type !== TaskInputTypeType.Activate) { 
                    console.log("\x1b[32m", `${inputName} -> ${input.displayName ?? inputName} (${input.dataType}, default=${JSON.stringify(input.defaultValue ?? "")})`, "\x1b[0m");
                }
            }
        }

        console.log("");

        return (await this.askChoice("\Inputs action", ["Done", "Add", "Remove", "Edit"], "Done"));
    }

    // Outputs
    private async handleOutputs(): Promise<void> {
        if (!this.asking) { return; } // Yo executes all methods from the class... This is an utility
        let choice = "";
        while ((choice = await this.askOutputsChoice()) !== "Done") {
             // Create the list to be used with Remove and Edit
             const allOutputs = ["**NONE**"];
             for (const outputName in this.values.outputs) {
                if (this.values.outputs.hasOwnProperty(outputName)) {
                    const output: TaskOutputType | string = this.values.outputs[outputName];
                    if (typeof (output) === "string" || output.type === TaskOutputTypeType.Static) {
                        allOutputs.push(outputName);
                    }
                }
            }

            switch (choice) {
                case "Add":
                    const output: TaskOutputType = {
                        type: TaskOutputTypeType.Static,
                        dataType: "String",
                        displayName: "",
                    };

                    const name = await this.askScalar("Output Name: ", ValueType.Text, "newOutput");
                    output.displayName = await this.askScalar("Output Display Name: ", ValueType.Text, this.pascalCaseValue(name));
                    // output.type = <any>(await this.askChoice("Output Type: ", ["Static", "Success", "Error"], output.type));
                    
                    if (output.type === TaskOutputTypeType.Static) {
                        output.dataType = await this.askValueType("Output Data Type:", <any>output.dataType, false);
                    }
                    
                    if (output.type === TaskOutputTypeType.Static && output.displayName === name) {
                        this.values.outputs[name] = output.dataType;
                    } else {
                        this.values.outputs[name] = output;
                    }

                    break;
                case "Remove":
                    const outputToRemove = await this.askChoice("\Output to remove", allOutputs, "");
                    if (outputToRemove !== "**NONE**") {
                        delete this.values.outputs[outputToRemove];
                    }
                    break;
                case "Edit":
                    const outputName = await this.askChoice("\Output to edit", allOutputs, "");
                    if (outputName !== "**NONE**") {
                        const outputToEdit = this.values.outputs[outputName];
                        delete this.values.outputs[outputName];

                        let output: TaskOutputType = {
                            type: TaskOutputTypeType.Static,
                            dataType: "String",
                            displayName: outputName,
                        };

                        if (typeof(outputToEdit) === "string") {
                            output.dataType = <any>outputToEdit;
                        } else {
                            output = outputToEdit;
                        }
    
                        const name = await this.askScalar("Output Name: ", ValueType.Text, outputName);
                        output.displayName = await this.askScalar("Output Display Name: ", ValueType.Text, output.displayName);
                        // output.type = <any>(await this.askChoice("Output Type: ", ["Static", "Success", "Error"], output.type));
                        
                        if (output.type === TaskOutputTypeType.Static) {
                            output.dataType = await this.askValueType("Output Data Type:", <any>output.dataType, false);
                        }
                        
                        if (output.type === TaskOutputTypeType.Static && output.displayName === name) {
                            this.values.outputs[name] = output.dataType;
                        } else {
                            this.values.outputs[name] = output;
                        }
                    }
                    break;
            }
        }
    }

    private async askOutputsChoice(): Promise<string> {
        if (!this.asking) { return("") } // Yo executes all methods from the class... This is an utility

        console.log("");
        console.log("Current Outputs:");
        for (const outputName in this.values.outputs) {
            if (this.values.outputs.hasOwnProperty(outputName)) {
                const output: TaskOutputType | string = this.values.outputs[outputName];

                if (typeof (output) === "string") {
                    console.log("\x1b[32m", `${outputName} -> ${outputName} (${output})`, "\x1b[0m");
                } else if (output.type === TaskOutputTypeType.Static) {
                    console.log("\x1b[32m", `${outputName} -> ${output.displayName ?? outputName} (${output.dataType})`, "\x1b[0m");
                }
            }
        }

        console.log("");

        return (await this.askChoice("\Outputs action", ["Done", "Add", "Remove", "Edit"], "Done"));
    }

    // Settings
    private async handleSettings() {
        if (!this.asking) { return } // Yo executes all methods from the class... This is an utility

        let choice = "";
        while ((choice = await this.askSettingsChoice()) !== "Done") {
            
            // Create the list to be used with Remove and Edit
            const allSettings = ["**NONE**"];
            for (const tab in this.values.settings) {
                if (this.values.settings.hasOwnProperty(tab)) {
                    for (const section in this.values.settings[tab]) {
                        if (this.values.settings[tab].hasOwnProperty(section)) {
                            for (let setting of this.values.settings[tab][section]) {
                                allSettings.push(`${tab}\\${section}\\${setting.name}`);
                            }
                        }
                    }
                }
            }

            switch (choice) {
                case "Add":
                    const setting: SettingsSetting = {
                        name: "settingName",
                        settingKey: "settingKey",
                        dataType: "String",
                        defaultValue: "",
                        settings: { }
                    };

                    let location: string = await this.askScalar("Setting location (<Tab>\\<Section>): ", ValueType.Text, "General\\Section1");
                    setting.name = await this.askScalar("Setting Name: ", ValueType.Text, setting.name);
                    setting.displayName = await this.askScalar("Setting Display Name: ", ValueType.Text, setting.name);
                    setting.settingKey = await this.askScalar("Setting Workflow Json Key: ", ValueType.Text, setting.settingKey);
                    setting.dataType = await this.askChoice("Setting Type: ", ["String", "Integer", "Long", "Boolean", "Object", "Enum"], setting.dataType);
                    if (setting.dataType === IoTValueType.Enum) {
                        let enumValues: string = await this.askScalar("Setting Enum Values (use ',' as separator): ", ValueType.Text, setting.enumValues?.join(","));
                        setting.enumValues = enumValues.split(",");
                    }
                    setting.defaultValue = await this.askScalar("Setting Default Value: ", ValueType.Text, setting.defaultValue ?? "");
                    setting.infoMessage = await this.askScalar("Setting Information Message (tooltip): ", ValueType.Text, setting.infoMessage ?? "");

                    this.addSetting(location, setting);
                    break;
                case "Remove":
                    // Get all keys
                    const settingToRemove = await this.askChoice("\nSettings to remove", allSettings, "");
                    if (settingToRemove !== "**NONE**") {
                        this.removeSetting(settingToRemove);
                    }
                    break;
                case "Edit":
                    // Get all keys
                    const settingToEdit = await this.askChoice("\nSettings to edit", allSettings, "");
                    if (settingToEdit !== "**NONE**") {
                        const setting = this.removeSetting(settingToEdit)!;

                        const [tabName, sectionName, settingName] = settingToEdit.split('\\');
                        let location: string = await this.askScalar("Setting location (<Tab>\\<Section>): ", ValueType.Text, `${tabName}\\${sectionName}`);
                        setting.name = await this.askScalar("Setting Name: ", ValueType.Text, setting.name);
                        setting.displayName = await this.askScalar("Setting Display Name: ", ValueType.Text, setting.displayName);
                        setting.settingKey = await this.askScalar("Setting Workflow Json Key: ", ValueType.Text, setting.settingKey);
                        setting.dataType = await this.askChoice("Setting Type: ", ["String", "Integer", "Long", "Boolean", "Object", "Enum"], setting.dataType);
                        if (setting.dataType === IoTValueType.Enum) {
                            let enumValues: string = await this.askScalar("Setting Enum Values (use ',' as separator): ", ValueType.Text, setting.enumValues?.join(","));
                            setting.enumValues = enumValues.split(",");
                        } else {
                            setting.enumValues = [];
                        }
                        setting.defaultValue = await this.askScalar("Setting Default Value: ", ValueType.Text, setting.defaultValue ?? "");
                        setting.infoMessage = await this.askScalar("Setting Information Message (tooltip): ", ValueType.Text, setting.infoMessage ?? "");

                        this.addSetting(location, setting);
                    }

                    break;
            }
        }
    }

    private async askSettingsChoice(): Promise<string> {
        if (!this.asking) { return("") } // Yo executes all methods from the class... This is an utility

        console.log("");
        console.log("Current Settings:");
        for (const tab in this.values.settings) {
            if (this.values.settings.hasOwnProperty(tab)) {
                console.log("\x1b[36m", tab, "\x1b[0m");
                
                for (const section in this.values.settings[tab]) {
                    if (this.values.settings[tab].hasOwnProperty(section)) {
                        console.log("\x1b[33m", "   ", section, "\x1b[0m");

                        for (let setting of this.values.settings[tab][section]) {
                            console.log("\x1b[32m", "      ", `${setting.settingKey} -> ${setting.displayName ?? setting.name} (${setting.dataType}, default=${JSON.stringify(setting.defaultValue ?? "")})`, "\x1b[0m");
                        }
                    }
                }
            }
        }

        console.log("");

        return (await this.askChoice("\nSettings action", ["Done", "Add", "Remove", "Edit"], "Done"));
    }

    private addSetting(path: string, setting: SettingsSetting): void {
        if (!this.asking) { return } // Yo executes all methods from the class... This is an utility

        if (path.indexOf("\\") == -1) {
            path += "\\Section";
        }
        const [tabName, sectionName] = path.split('\\');

        for (const tab in this.values.settings) {
            if (this.values.settings.hasOwnProperty(tab) && tab === tabName) {
                for (const section in this.values.settings[tab]) {
                    if (this.values.settings[tab].hasOwnProperty(section) && section === sectionName) {
                        this.values.settings[tab][section].push(setting);
                        return;
                    }
                }

                // Got here? Then the section is not present
                this.values.settings[tab][sectionName] = [ setting ];

                return;
            }
        }

        // ot here, then it is a new tab
        this.values.settings[tabName] = { };
        this.values.settings[tabName][sectionName] = [ setting ];
    }

    private removeSetting(path: string): SettingsSetting | undefined {
        if (!this.asking) { return } // Yo executes all methods from the class... This is an utility

        const [tabName, sectionName, settingName] = path.split('\\');

        for (const tab in this.values.settings) {
            if (this.values.settings.hasOwnProperty(tab) && tab === tabName) {
                for (const section in this.values.settings[tab]) {
                    if (this.values.settings[tab].hasOwnProperty(section) && section === sectionName) {
                        for (let settingObj of this.values.settings[tab][section]) {
                            const setting: SettingsSetting = settingObj;
                            if (setting.name === settingName) {
                                const arr: any[] = this.values.settings[tab][section];
                                const index = arr.indexOf(setting);
                                arr.splice(index, 1);
                                return (setting);
                            }
                        }
                    }
                }
            }
        }

        return (undefined);
    }


    /**
     * Will copy the templates for the framework tailoring all the files with the base framework it's extending from.
     */
    copyTemplates() {
        // inputs
        for (const inputName in this.values.inputs) {
            if (this.values.inputs.hasOwnProperty(inputName)) {
                const value = this.values.inputs[inputName];

                if (typeof(value) === "object" && value.type === TaskInputTypeType.Activate) {
                    // Ignore
                } else {
                    let type = typeof(value) === "string" ? "string" : (value.dataType ?? "string");
                    if (type === "") {
                        type = "string";
                    }
                    const def = typeof(value) === "string" ? "\"\"" : JSON.stringify(value.defaultValue);
                    const comment = typeof(value) === "string" ? undefined : value.displayName;
                    if (comment !== undefined) {
                        this.values.inputsInterface += `\t/** ${comment} */\r\n`;
                    }
                    this.values.inputsInterface += `\tpublic ${inputName}: ${this.toJSType(<any>this.pascalCaseValue(type))} = ${def};\r\n`;
                }
            }
        }
        this.values.inputsInterface = this.values.inputsInterface.trim();

        // outputs
        for (const outputName in this.values.outputs) {
            if (this.values.outputs.hasOwnProperty(outputName)) {
                const value = this.values.outputs[outputName];
                if (typeof(value) === "object" && (value.type === TaskOutputTypeType.Success || TaskOutputTypeType.Error)) {
                    // Ignore
                } else {
                    let type = typeof(value) === "string" ? "string" : (value.dataType ?? "string");
                    if (type === "") {
                        type = "string";
                    }
                    const comment = typeof(value) === "string" ? undefined : value.displayName;
                    if (comment !== undefined) {
                        this.values.outputsInterface += `\t/** ${comment} */\r\n`;
                    }
                    this.values.outputsInterface += `\tpublic ${outputName}: Task.Output<${this.toJSType(<any>this.pascalCaseValue(type))}> = new Task.Output<${this.toJSType(<any>this.pascalCaseValue(type))}>();\r\n`;
                }
            }
        }
        this.values.outputsInterface = this.values.outputsInterface.trim();

        // Settings
        for (const tab in this.values.settings) {
            if (this.values.settings.hasOwnProperty(tab)) {
                for (const section in this.values.settings[tab]) {
                    if (this.values.settings[tab].hasOwnProperty(section)) {
                        for (let setting of this.values.settings[tab][section]) {
                            this.values.settingsInterface += `\t/** ${setting.infoMessage ?? setting.displayName ?? setting.name} */\r\n`;
                            this.values.settingsInterface += `\t${setting.settingKey}: ${this.toJSType(<any>this.pascalCaseValue(setting.dataType ?? "String"))};\r\n`;
                            this.values.settingsDefaults += `\t${setting.settingKey}: ${JSON.stringify(setting.defaultValue)},\r\n`;
                            this.values.testSettingsDefaults += `\t\t\t\t${setting.settingKey}: ${JSON.stringify(setting.defaultValue)},\r\n`;

                        }
                    }
                }
            }
        }

        this.values.settingsInterface = this.values.settingsInterface.trim();
        this.values.settingsDefaults = this.values.settingsDefaults.trim();
        this.values.testSettingsDefaults = this.values.testSettingsDefaults.trim();

        // Add new task entry in metadata file
        const destinationFile = this.destinationPath("src", "metadata.ts");
        if (!this.fs.exists(destinationFile)) {
            this.env.error(new Error("Unable to find 'metadata.ts' file. Make sure you are running the command from the root directory (same as package.json)"));
        }

        this.injectInFile(destinationFile, "tasks: [", "],", `"${this.values.name}",\r\n`);

        let filesWithRename: Map<string, string> = new  Map<string, string>([
            ["index.ts", "index.ts"],
            ["task.task.ts", `${this.values.name}.task.ts`],
        ]);
        filesWithRename.forEach((value, key) => {
            this.fs.copyTpl(this.templatePath("src", key), this.destinationPath("src", "tasks", this.values.name, value), this.values);
        });

        // test
        this.fs.copyTpl(this.templatePath("test", "task.task.test.ts"), this.destinationPath("test", "unit", "tasks", this.values.name, `${this.values.name}.task.test.ts`), this.values);

        // Create the Json template
        const taskTemplate: LibraryMetadata = {
            converters: [],
            tasks: [{
                name: this.values.name,
                displayName: this.values.title,
                iconClass: this.values.iconClass === "" ? undefined : this.values.iconClass,
                iconSVG: this.values.svg === "" ? undefined : this.values.svg,
                isProtocol: this.values.isProtocol,
                isController: this.values.isController,
                lifecycle: this.values.lifecycle,
                lifecycleMessage: this.values.lifecycleMessage,
                dependsOnProtocol: this.values.dependsOnProtocol,
                dependsOnScope: this.values.dependsOnScope,
                inputs: this.values.inputs,
                outputs: this.values.outputs,
                settings: this.values.settings
            }]
        }

        this.fs.writeJSON(this.destinationPath("templates", `task_${this.values.name}.json`), taskTemplate);
    }

    /**
     * Will install the framework's package as well as the web app.
     */
    install() {
    }

    end() {
    }
}

declare var module: any;
(module).exports = GeneratorTask;
