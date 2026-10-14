#!/usr/bin/env node
import * as path from "path";
import { parseArgs } from "node:util";
import { PackagePacker } from "./packagePacker";

/** Runs the existing package packer without the Yeoman launcher. */
export async function main(args = process.argv.slice(2)): Promise<void> {
    const { values } = parseArgs({
        args,
        options: {
            input: { type: "string", short: "i" },
            output: { type: "string", short: "o" },
            temp: { type: "string", short: "t" },
            config: { type: "string", short: "c" },
            addons: { type: "string", short: "a" },
            debug: { type: "boolean", short: "d" },
            version: { type: "string", short: "v" },
            help: { type: "boolean", short: "h" }
        }
    });
    if (values.help) {
        console.log(`Usage: cmf-iot-pack [options]

  -i, --input <directory>    Package source (default: current directory)
  -o, --output <directory>   Destination for the generated tarball
  -t, --temp <directory>     Temporary directory (default: <input>/__TEMP__)
  -c, --config <file>        Configuration (default: <input>/packConfig.json)
  -a, --addons <directory>   Compiled addons
  -d, --debug               Keep temporary files
  -v, --version <version>    Override the package version
  -h, --help                 Show this help`);
        return;
    }

    const source = path.resolve(values.input || process.cwd());
    const options = {
        i: source,
        o: values.output ? path.resolve(values.output) : "",
        t: path.resolve(values.temp || path.join(source, "__TEMP__")),
        c: path.resolve(values.config || path.join(source, "packConfig.json")),
        a: values.addons ? path.resolve(values.addons) : "",
        d: values.debug || false,
        v: values.version || ""
    };
    // The engine resolves package files against cwd, just as the Yeoman command does.
    process.chdir(source);
    console.log(`Using scaffolding version '${require("../../package.json").version}'\n`);
    await new PackagePacker().go(options);
}

if (require.main === module) {
    main().catch(error => {
        console.error(process.argv.includes("-d") || process.argv.includes("--debug") ? error.stack : error.message);
        process.exitCode = 1;
    });
}
