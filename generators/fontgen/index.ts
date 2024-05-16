import { ConnectIoTGenerator, ValueType, IoTValueType } from "../base";
import { fontGen } from "./fontgen";


class GeneratorFontGen extends ConnectIoTGenerator {

    constructor(args: any, opts: any) {
        super(args, opts);

        if (!this.fs.exists(this.destinationPath("font.js"))) {
            this.env.error(new Error(`Unable to find 'font.js' file in the current directory. Make sure you are running the command from the location where you have the fonts (SVGs + font.js metadata file)`));
        }
    }

    /**
     * Will prompt the user for converter details
     */
    // https://www.npmjs.com/package/inquirer
    public async prompting() {


    }

    /**
     * Will copy the templates for the framework tailoring all the files with the base framework it's extending from.
     */
    public async copyTemplates(): Promise<void> {
        const generator = new fontGen();
        await generator.go(this.destinationPath(), this.destinationPath(".."))
    }

    /**
     * Will install the framework's package as well as the web app.
     */
    public async install() {
    }

    public end() {
    }
}

declare var module: any;
(module).exports = GeneratorFontGen;
