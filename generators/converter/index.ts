import { ConnectIoTGenerator, ValueType, IoTValueType } from "../base";

const chalk = require("chalk");

class GeneratorConverter extends ConnectIoTGenerator {

    private values: any = {
        name: "somethingToSomething", // camel case
        className: "",                    // pascal case
        title: "something To Something",
        input: IoTValueType.Any,
        output: IoTValueType.Any,

        inputAsJS: "undefined",
        inputAsIoT: "any",
        outputAsJS: "undefined",
        outputAsIoT: "any",
        hasParameters: false,
        parameters: new Map<string, IoTValueType>(),
        parametersAsJS: "",
    };

    constructor(args: any, opts: any) {
        super(args, opts);

        if (!this.fs.exists(this.destinationPath("package.json"))) {
            this.env.error(new Error("Unable to identify project location. Make sure you are running the command from the root directory (same as package.json)"));
        }
    }

    /**
     * Will prompt the user for converter details
     */
    // https://www.npmjs.com/package/inquirer
    async prompting() {

        // Basic information request
        this.values.name = this.camelCaseValue(await this.askScalar("What is the converter name?", ValueType.Text, this.values.name));
        this.values.title = await this.askScalar("What is the converter title?", ValueType.Text, this.values.title);
        this.values.input = await this.askValueType("What is the input type?", this.values.input);
        this.values.output = await this.askValueType("What is the output type?", this.values.output);

        // Parameter request
        this.values.hasParameters = await this.askScalar("Do you require parameters?", ValueType.Confirm, this.values.hasParameters);
        if (this.values.hasParameters) {
            let more: boolean = true;
            while (more) {
                let name: string = await this.askScalar("Parameter Name: ", ValueType.Text, "");
                let type: IoTValueType = await this.askValueType("Parameter Type: ", IoTValueType.String, true);

                this.values.parameters.set(name, type);
                more = await this.askScalar("More parameters?", ValueType.Confirm, true);
            }
        }

        // Values converters
        this.values.className = this.pascalCaseValue(this.values.name);
        this.values.inputAsJS = this.toJSType(this.values.input);
        this.values.inputAsIoT = this.toIotType(this.values.input);
        this.values.outputAsJS = this.toJSType(this.values.output);
        this.values.outputAsIoT = this.toIotType(this.values.output);

        // parameters
        if (this.values.hasParameters === true) {
            let parameters: Map<string, IoTValueType> = this.values.parameters;
            parameters.forEach((value, key) => {
                let val = this.toIotType(value);
                if (value === IoTValueType.Any || value === IoTValueType.Enum) {
                    val = `[{
            friendlyName: "First",
            value: "1"
          }, {
            friendlyName: "Second",
            value: "2"
        }]`;
                }
                this.values.parametersAsJS += `        ${key}: ${val},\r\n`;
            });

            this.values.parametersAsJS = this.values.parametersAsJS.trimRight();
        }
    }

    /**
     * Will copy the templates for the framework tailoring all the files with the base framework it's extending from.
     */
    copyTemplates() {

        // Add new converter entry in metadata file
        const destinationFile = this.destinationPath("src", "metadata.ts");
        if (!this.fs.exists(destinationFile)) {
            this.env.error(new Error("Unable to find 'metadata.ts' file. Make sure you are running the command from the root directory (same as package.json)"));
        }

        this.injectInFile(destinationFile, "converters: [", "],", `"${this.values.name}",\r\n`);

        let filesWithRename: Map<string, string> = new  Map<string, string>([
            ["index.ts", "index.ts"],
            ["converter.converter.ts", `${this.values.name}.converter.ts`],
        ]);
        filesWithRename.forEach((value, key) => {
            this.fs.copyTpl(this.templatePath("src", key), this.destinationPath("src", "converters", this.values.name, value), this.values);
        });
        
        this.fs.copyTpl(this.templatePath("src", "i18n", "converter.default.ts"), this.destinationPath("src", "converters", this.values.name, "i18n", `${this.values.name}.default.ts`), this.values);

        // test
        this.fs.copyTpl(this.templatePath("test", "converter.converter.test.ts"), this.destinationPath("test", "unit", "converters", this.values.name, `${this.values.name}.converter.test.ts`), this.values);
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
(module).exports = GeneratorConverter;
