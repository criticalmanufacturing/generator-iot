import { Log } from "./log";
import * as io from "fs-extra";
import * as path from "path";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { transform } from "@swc/core";

@injectable()
export class Transpiler {

    @inject(TYPES.Logger)
    private _logger: Log;

    public async preProcessTaskScripts(templateDirectory: string, value: any): Promise<any> {
        if (value == null) {
            return value;
        }

        const isMatchScriptFunc = (valueToCheck: string): { isMatch: boolean, matchedValue: string } => {
            const regex = /\${script\((.*)\)}/i;
            const matches = valueToCheck.match(regex);

            if (matches != null && matches.length === 2) {
                return { isMatch: true, matchedValue: matches[1] };
            }

            return { isMatch: false, matchedValue: "" };
        };

        const isMatchScriptArray = (valueToCheck: string): { isMatch: boolean, matchedValue: string } => {
            const regex = /\${script\[\]\((.*)\)}/i;
            const matches = valueToCheck.match(regex);

            if (matches != null && matches.length === 2) {
                return { isMatch: true, matchedValue: matches[1] };
            }

            return { isMatch: false, matchedValue: "" };
        };

        const readAndTranspile = async (scriptType: string, pathMatch: string) => {
            this._logger.debug(` [Templates]   Processing Script as ${scriptType} '${pathMatch}'`);
            const scriptFile = path.resolve(templateDirectory, pathMatch);
            const scriptContent = io.readFileSync(scriptFile).toString();

            const regexTokenMatcherForPackagePacker = /\/\/\s+PackagePacker:\s+Start\s+of\s+Script([\s\S]*?)\/\/\s+PackagePacker:\s+End\s+of\s+Script/i;
            const regexTokenMatcherForAsyncPackagePacker = /\/\/\s+PackagePacker:\s+Start\s+of\s+Async\s+Script([\s\S]*?)\/\/\s+PackagePacker:\s+End\s+of\s+Async\s+Script/i;

            const matches = scriptContent.match(regexTokenMatcherForPackagePacker);
            const matchesAsync = scriptContent.match(regexTokenMatcherForAsyncPackagePacker);
            if (matches != null && matches.length === 2) {
                // Check for hooks
                // Start Hook -> // PackagePacker: Start of Script
                // End Hook -> // PackagePacker: End of Script
                return await this.transpile(matches[1].trim(), false);
            } else if (matchesAsync != null && matchesAsync.length === 2) {
                // Check for hooks and Add start '(async () => {' declaration and end '})();'
                // Start Hook -> // PackagePacker: Start of Async Script
                // End Hook -> // PackagePacker: End of Async Script
                const script = "(async () => {\r\n" + matchesAsync[1].trim() + "\r\n})();";
                return await this.transpile(script, false);
            }
            else {
                return await this.transpile(scriptContent, false);
            }
        };

        const isArray = (valueToCheck: any) => typeof (valueToCheck) === "object" && Array.isArray(valueToCheck);
        const isObject = (valueToCheck: any) => typeof (valueToCheck) === "object" && !Array.isArray(valueToCheck);
        const isString = (valueToCheck: any) => typeof (valueToCheck) === "string";

        if (isArray(value)) {

            for (let i = 0; i < value.length; i++) {
                value[i] = await this.preProcessTaskScripts(templateDirectory, value[i]);
            }
        } else if (isObject(value)) {

            const keys = Object.keys(value);
            for (const key of keys) {
                value[key] = await this.preProcessTaskScripts(templateDirectory, value[key]);
            }
        } else if (isString(value)) {

            const isMatchFunc = isMatchScriptFunc(value);
            const isMatchArray = isMatchScriptArray(value);

            if (isMatchFunc.isMatch) {

                const transpiled = await readAndTranspile("()", isMatchFunc.matchedValue);
                value = Buffer.from(transpiled).toString("base64");
            } else if (isMatchArray.isMatch) {

                const transpiled = await readAndTranspile("[]", isMatchArray.matchedValue);
                value = transpiled.split("\n");
            }
        }
        return value;
    }

    public async transpile(code: string, compress: boolean): Promise<string> {
        const res = await transform(code, {
            jsc: {
                parser: {
                    syntax: "typescript",
                },
                transform: {

                },
                target: "es2016",
                minify: {
                    compress: compress,
                }
            },
            minify: compress,
        });

        return (res.code);
    }
}