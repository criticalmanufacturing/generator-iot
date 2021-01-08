import * as path from "path";
import { ConnectIoTGenerator } from "../base";

const chalk = require("chalk");
var yosay = require("yosay");
import { Answers } from "yeoman-generator";

class GeneratorApp extends ConnectIoTGenerator {

    private packagePrefix: string = "";
    private registry: string = "";
    private channel: string = "";

    constructor(args: any, opts: any) {
        super(args, opts);

        this.option("keep", { type: Boolean, default: false });

        this.log(yosay('Welcome to the Connect IoT scaffolding tool!'));

        this.log(this.usage()); // .help() show all command line parameters 
        this.log("");
        this.log(chalk.cyan("Deployment apps:"));
        this.log("  " + chalk.yellow("packagePacker") + " -> Create a self-packaged package for deployment");
        this.log("");
        this.log(chalk.cyan("Development apps:"));
        this.log("  " + chalk.yellow("tasksPackage") + "  -> Create a new basic package code for custom Tasks/Converters");
        this.log("  " + chalk.yellow("task") + "          -> Create the skeleton for a Task");
        this.log("  " + chalk.yellow("converter") + "     -> Create the skeleton for a Converter");
        this.log("  " + chalk.yellow("driver") + "        -> Create a basic package code for a new Protocol Driver");
        this.log("  " + chalk.yellow("fontgen") + "       -> Create a font based on SVG icons to use with Tasks Packages");
        this.log("");
    }

    prompting() {
    }

    writing() {
    }
}


declare var module: any;
(module).exports = GeneratorApp;
