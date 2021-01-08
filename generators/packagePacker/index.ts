       
        // this.argument('packageName', { type: String, required: true });
        // console.log(args);
        // console.log(opts);
        // this.values.fileName = this.camelCaseValue(this.options.packageName);
        // // Prepend the package suffix if not present
        // if (!this.options.packageName.startsWith(`${this.ctx.packagePrefix}.`)) {
        //   this.options.packageName = `${this.ctx.packagePrefix}.${this.options.packageName}`;
        // }
    
        // // If this command was not executed from the root, exit    
        // if (this.config.get("isRoot") !== true) {
        //   this.env.error(new Error("Please execute this command outside a package. Hint: use the root of the repository."));
        // } 

        
import { ConnectIoTGenerator, ValueType, IoTValueType } from "../base";
import { PackagePacker } from "./packagePacker";

class GeneratorPackagePacker extends ConnectIoTGenerator {

    constructor(args: any, opts: any) {
        super(args, opts);

        this.option("i", { alias: "input", type: String, default: process.cwd(), description: "Location of the package to pack" });
        this.option("o", { alias: "output", type: String, default: "", description: "Location of the generated package will be stored" });
        this.option("t", { alias: "temp", type: String, default: `${process.cwd()}\\__TEMP__`, description: "Temporary location to use" });
        this.option("c", { alias: "config", type: String, default: `${process.cwd()}\\packConfig.json`, description: "Location of the Configuration to use" });
        this.option("a", { alias: "addons", type: String, default: "", description: "Location of the compiled addons" });
        this.option("d", { alias: "debug", type: Boolean, default: false, description: "Debug Mode (doesn't delete temporary directory after processing)" });
        this.option("v", { alias: "version", type: String, default: "", description: "Version to use to generate the package" });

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
        const generator = new PackagePacker();
        await generator.go(this.options);
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
(module).exports = GeneratorPackagePacker;
