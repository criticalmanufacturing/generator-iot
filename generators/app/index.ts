import { ConnectIoTGenerator } from "../base";
var yosay = require("yosay");

class GeneratorApp extends ConnectIoTGenerator {

    constructor(args: any, opts: any) {
        super(args, opts);

        this.option("keep", { type: Boolean, default: false });

        this.log(yosay(`Welcome to the Connect IoT ${this.getVersion()} scaffolding tool!`));

        this.log(this.usage()); // .help() show all command line parameters 
        this.log("");
        console.log("\x1b[36m", "Deployment apps:", "\x1b[0m");
        console.log("\x1b[33m", "  packagePacker", "\x1b[0m", " -> Create a self-packaged package for deployment");
        console.log("\x1b[36m", "Development apps:", "\x1b[0m");
        console.log("\x1b[33m", "  driver", "\x1b[0m", "        -> Create a basic package code for a new Protocol Driver");
        console.log("\x1b[33m", "  tasksLibrary", "\x1b[0m", "  -> Create an empty task library package");
        console.log("\x1b[33m", "  task", "\x1b[0m", "          -> Create a new task to be used in a tasks library package");
        console.log("\x1b[33m", "  converter", "\x1b[0m", "     -> Create a new converter to be used in a tasks library package");
        console.log("\x1b[36m", "Development tools:", "\x1b[0m");
        console.log("\x1b[33m", "  fontgen", "\x1b[0m", "        -> Create a font based on SVG icons to use with Tasks Libraries");
    }

    prompting() {
    }

    writing() {
    }
}


declare var module: any;
(module).exports = GeneratorApp;
