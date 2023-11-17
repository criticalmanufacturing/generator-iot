import { ConnectIoTGenerator } from "../base";
var yosay = require("yosay");

class GeneratorApp extends ConnectIoTGenerator {

    private packagePrefix: string = "";
    private registry: string = "";
    private channel: string = "";

    constructor(args: any, opts: any) {
        super(args, opts);

        this.option("keep", { type: Boolean, default: false });

        this.log(yosay('Welcome to the Connect IoT 10.2.x scaffolding tool!'));

        this.log(this.usage()); // .help() show all command line parameters 
        this.log("");
        console.log("\x1b[36m", "Deployment apps:", "\x1b[0m");
        console.log("\x1b[33m", "  packagePacker", "\x1b[0m", " -> Create a self-packaged package for deployment");
        console.log("\x1b[36m", "Development apps:", "\x1b[0m");
        console.log("\x1b[33m", "  driver", "\x1b[0m", "        -> Create a basic package code for a new Protocol Driver");
        console.log("\x1b[33m", "  tasksLibrary", "\x1b[0m", "  -> Create an empty task library package");
    }

    prompting() {
    }

    writing() {
    }
}


declare var module: any;
(module).exports = GeneratorApp;
