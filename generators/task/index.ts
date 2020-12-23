import { ConnectIoTGenerator, ValueType, IoTValueType } from "../base";

class GeneratorTask extends ConnectIoTGenerator {

    private values: any = {
        name: "blackBox", // camel case
        className: "",                    // pascal case
        title: "Black Box",
        icon: "icon-core-connect-iot-lg-logmessage",
        hasInputs: false,
        hasOutputs: false,
        isForProtocol: false,
    };

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

        // Basic information request
        this.values.name = this.camelCaseValue(await this.askScalar("What is task name?", ValueType.Text, this.values.name));
        this.values.title = await this.askScalar("What is the task title?", ValueType.Text, this.values.title);
        this.values.icon = await this.askScalar("What is the icon name?", ValueType.Text, this.values.icon);
        this.values.hasInputs = await this.askScalar("Will this task have dynamic inputs?", ValueType.Confirm, this.values.hasInputs);
        this.values.hasOutputs = await this.askScalar("Will this task have dynamic outputs?", ValueType.Confirm, this.values.hasOutputs);
        this.values.isForProtocol = await this.askScalar("Is this task used by the protocol driver?", ValueType.Confirm, this.values.isForProtocol);

        // Values converted
        this.values.className = this.pascalCaseValue(this.values.name);
    }

    /**
     * Will copy the templates for the framework tailoring all the files with the base framework it's extending from.
     */
    copyTemplates() {

        // Add new task entry in metadata file
        const destinationFile = this.destinationPath("src", "metadata.ts");
        if (!this.fs.exists(destinationFile)) {
            this.env.error(new Error("Unable to find 'metadata.ts' file. Make sure you are running the command from the root directory (same as package.json)"));
        }

        this.injectInFile(destinationFile, "tasks: [", "],", `"${this.values.name}",\r\n`);

        let filesWithRename: Map<string, string> = new  Map<string, string>([
            ["index.ts", "index.ts"],
            ["index.settings.ts", "index.settings.ts"],
            ["task.settings.ts", `${this.values.name}.settings.ts`],
            ["task.settings.html", `${this.values.name}.settings.html`],
            ["task.settings.less", `${this.values.name}.settings.less`],
            ["task.designer.ts", `${this.values.name}.designer.ts`],
            ["task.task.ts", `${this.values.name}.task.ts`],
        ]);
        filesWithRename.forEach((value, key) => {
            this.fs.copyTpl(this.templatePath("src", key), this.destinationPath("src", "tasks", this.values.name, value), this.values);
        });

        // Task translations
        this.fs.copyTpl(this.templatePath("src", "i18n", "task.default.ts"), this.destinationPath("src", "tasks", this.values.name, "i18n", `${this.values.name}.default.ts`), this.values);
        this.fs.copyTpl(this.templatePath("src", "i18n", "task.settings.default.ts"), this.destinationPath("src", "tasks", this.values.name, "i18n", `${this.values.name}.settings.default.ts`), this.values);

        // test
        this.fs.copyTpl(this.templatePath("test", "task.task.test.ts"), this.destinationPath("test", "unit", "tasks", this.values.name, `${this.values.name}.task.test.ts`), this.values);
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
