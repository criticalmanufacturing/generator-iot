import * as fs from "fs";
import * as path from "path";
import * as punycode from "punycode";

export class fontGen {

    // ---- Extracted and adapted from fontgen.js ----
    private author = "Critical Manufacturing S.A.";
    private fontConfig = "font.js";
    private validSizes = ["lg", "sm"];
    
    private map_default: any = {
        sourceDir: undefined,
        targetDir: "dist",
        meta: {
            author: this.author,
            homepage: "http://www.criticalmanufacturing.com",
            license: "Proprietary"
        },
        font: {
            weight: "normal",
            style: "normal",
            "units-per-em": 1000,
            ascent: 850,
            descent: 0,
            copyright: `Copyright © ${new Date().getUTCFullYear()} by ${this.author}`,
            prefix: "icon-",
            startcode: 0xe000
        },
        glyphs: []
    }    

    private gray(text: string): string {
        return (`\x1b[37m${text}\x1b[0m`);
    }
    private yellow(text: string): string {
        return (`\x1b[33m${text}\x1b[0m`);
    }
    private blue(text: string): string {
        return (`\x1b[34m${text}\x1b[0m`);
    }

    private capitalize(string: string): string {
        if (string != null) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }
        return "";
    }

    private log(text: string) {
        console.log(text);
    }

    
    private generateMap(sourceDir: string, targetDir: string): any {
        let map = Object.assign({}, this.map_default);
        
        map.sourceDir = sourceDir;
        map.targetDir = targetDir;
    
        // 1. Read configuration file to get specific font options
        let fcPath = path.join(sourceDir, this.fontConfig);
        
        if (fs.existsSync(fcPath)) {
            // Require file
            let fontCfg = require(path.resolve(".", fcPath));
            // Merge configs
            map.meta = Object.assign(map.meta, fontCfg.meta);
            map.font = Object.assign(map.font, fontCfg.font);
            // Make sure prefix starts by "icon-"
            if (!map.font.prefix.startsWith("icon-")) {
                map.font.prefix = "icon-" + map.font.prefix;
            }
        }

        // 2. Walk for files in source directory and find all files
        let files = fs.readdirSync(map.sourceDir);

        // Filter files with extension .svg
        files = files.filter(function(file: string) {
            return path.extname(file) === ".svg";
        });

        const validSizes = this.validSizes;
        // Fill glyphs array with metadata for each source file
        map.glyphs = files.map(function(file: string, index: number) {
            const glyph: any = {};
    
            glyph.file = file;
            glyph.src = path.resolve(path.join(map.sourceDir, file));
    
            let fileName = path.basename(file, ".svg");
    
            // If the font is unisize, just use it as it is
            if (map.font.unisize) {
                glyph.css = fileName;
                glyph.search = [fileName];
                glyph.name = fileName;
            } else {
                // get size and name
                let nameParts = fileName.split("-");
                let size = nameParts.pop();
                if (validSizes.indexOf(size as any) < 0) {
                    throw new Error(`File '${file}' is invalid`);
                }
                let name = nameParts.join("-");
    
                glyph.css = size + "-" + name;
                glyph.name = name;
                glyph.search = [name, size];
                glyph.size = size;
            }
    
            glyph.cssClass = map.font.prefix + "-" + glyph.css;
    
            glyph.code = punycode.ucs2.encode([map.font.startcode + index]);
    
            return glyph;
        });
        
        if (map.glyphs.length === 0) {
            throw new Error(`No glyphs found in '${map.sourceDir}'. Aborting...`);
        }
    
        return map;
    }
    
    private writeIndex(map: any) {
        let indexStructure: any = {};
    
        if (map && map.glyphs) {
            for(let glyph of map.glyphs){
                indexStructure[glyph.cssClass] = {
                    code: JSON.stringify(glyph.code).replace(/[\u0080-\uFFFF]/g, function(m) {
                        return "\\" + ("0000" + m.charCodeAt(0).toString(16)).slice(-4);
                    }),
                    size: glyph.size,
                    name: this.capitalize(glyph.name)
                };
    
                indexStructure[glyph.cssClass].code = indexStructure[glyph.cssClass].code.substring(1,indexStructure[glyph.cssClass].code.length-1);
            }
        }
    
        let finalTsFileContent = "export default " + JSON.stringify(indexStructure);
        let indexPath = path.resolve(path.join(map.targetDir, "metadata.ts"));
    
        this.log(`Writing Index Typescript file '${indexPath}'`);
        fs.writeFileSync(indexPath, finalTsFileContent);
    }

    private writeConfig(map: any) {
        const config: string[] = [];
        config.push("{");
        config.push(`   "name": "${map.font.fontname}",`);
        config.push(`   "fonts": {`);

        config.push(`      "ttf": "${fs.readFileSync(path.join(map.targetDir, `${map.font.fontname}.ttf`), {encoding: "base64"})}",`);
        config.push(`      "woff": "${fs.readFileSync(path.join(map.targetDir, `${map.font.fontname}.woff`), {encoding: "base64"})}",`);
        config.push(`      "woff2": "${fs.readFileSync(path.join(map.targetDir, `${map.font.fontname}.woff2`), {encoding: "base64"})}"`);

        config.push(`   },`);
        config.push(`   "icons": {`);

        const count = map.glyphs.length;
        let i = 0;
        for (let glyph of map.glyphs) {
            i++;
            const json = JSON.stringify(glyph.code).replace(/[\u0080-\uFFFF]/g, function(m) {
                return "\\\\" + ("0000" + m.charCodeAt(0).toString(16)).slice(-4);
            });
        
            config.push(`      "${glyph.cssClass}": ${json}${i === count ? "" : ","}`);
        }

        config.push(`   }`);
        config.push("}");

        fs.writeFileSync(path.join(map.targetDir, `config.json`), config.join("\n"));
    }

    private writeLESS(map: any) {
        let ts = new Date().getTime();
        //write config file
    
        //write CSS identifiers file
        let cssIds = [];
        cssIds.push(`/* character CSS identifiers for ${map.font.fontname} font */`);
        cssIds.push("");
    
        let abstractCssIds = ["/* abstract CSS selectors to be re-used */"];
        let specCssIds = ["", "/* default CSS selectors available for direct use in the recommended cases */"];
    
        for (let glyph of map.glyphs) {
            const json = JSON.stringify(glyph.code).replace(/[\u0080-\uFFFF]/g, function(m) {
                return "\\" + ("0000" + m.charCodeAt(0).toString(16)).slice(-4);
            });
            let cssId = `.abstract-${glyph.cssClass} { content: ${json}; } /* '${glyph.code}' */`;
            abstractCssIds.push(cssId);
    
            var specId = `.${glyph.cssClass}:before { .abstract-${glyph.cssClass} } /* '${glyph.code}' */`;
            specCssIds.push(specId);
        }
    
        Array.prototype.push.apply(cssIds, abstractCssIds);
        Array.prototype.push.apply(cssIds, specCssIds);
    
        let lessConfigFile = `${map.font.prefix}-config.less`;
        let lessConfig = path.resolve(path.join(map.targetDir, lessConfigFile));
        this.log(`Writing CSS Config file '${lessConfig}'`);
        fs.writeFileSync(lessConfig, cssIds.join("\n"));
    
        var fontMeta = [];
        fontMeta.push(`/* CSS declaration file for ${map.font.fontname} font */`);
        fontMeta.push("");
        fontMeta.push("@font-face {");
        //     //map.font.fontname
        fontMeta.push(`    font-family: '${map.font.fontname}';`);
        fontMeta.push(`    src: ~\"url('@{font-${map.font.fontname}-dir}/${map.font.fontname}.eot?${ts}')\";`); //timestamp
        fontMeta.push(`    src: ~\"url('@{font-${map.font.fontname}-dir}/${map.font.fontname}.eot?${ts}#iefix') format('embedded-opentype')\",`);
        fontMeta.push(`        ~\"url('@{font-${map.font.fontname}-dir}/${map.font.fontname}.woff?${ts}') format('woff')\",`);
        fontMeta.push(`        ~\"url('@{font-${map.font.fontname}-dir}/${map.font.fontname}.woff2?${ts}') format('woff2')\",`);
        fontMeta.push(`        ~\"url('@{font-${map.font.fontname}-dir}/${map.font.fontname}.ttf?${ts}') format('truetype')\",`);
        fontMeta.push(`        ~\"url('@{font-${map.font.fontname}-dir}/${map.font.fontname}.svg?${ts}#${map.font.fontname}') format('svg')\";`);
        fontMeta.push(`    font-weight: ${map.font.weight}`);
        fontMeta.push(`    font-style: ${map.font.style};`);
        fontMeta.push("}");
        fontMeta.push("");
        fontMeta.push(`[class^=\"${map.font.prefix}\"]:before, [class*=\" ${map.font.prefix}\"]:before {`);
        fontMeta.push(`    font-family: \"${map.font.fontname}\";`);
        fontMeta.push(`    font-style: ${map.font.style};`);
        fontMeta.push(`    font-weight: ${map.font.weight};`);
        fontMeta.push("    speak: none;");
        fontMeta.push("");
        fontMeta.push("    display: inline-block;");
        fontMeta.push("    text-decoration: inherit;");
        fontMeta.push("    text-align: center;");
        fontMeta.push("");
        fontMeta.push("    /* For safety - reset parent styles, that can break glyph codes*/");
        fontMeta.push("    font-variant: normal;");
        fontMeta.push("    text-transform: none;");
        fontMeta.push("");
        //fontMeta.push("    /* fix buttons height, for twitter bootstrap */");
        //fontMeta.push(util.format("    line-height: %s;", map.font.lineHeight ?? "1em"));
        fontMeta.push("");
        fontMeta.push("    /* Font smoothing. That was taken from TWBS */");
        fontMeta.push("    -webkit-font-smoothing: antialiased;");
        fontMeta.push("    -moz-osx-font-smoothing: grayscale;");
        fontMeta.push("}");
        fontMeta.push("");
        //container styles
        fontMeta.push(`[class^=\"${map.font.prefix}\"], [class*=\" ${map.font.prefix}\"] {`);
        fontMeta.push("    display: inline-block;");
        fontMeta.push("    text-align: center;");
        fontMeta.push("}");
        fontMeta.push("");
    
        fontMeta.push("// import the character CSS codes for this font");
        fontMeta.push(`@import (less) \"${lessConfigFile}\";`);
    
        var lessCSS = path.resolve(path.join(map.targetDir, `${map.font.prefix}-font.less`));
        this.log(`Writing LESS Definition file '${lessCSS}'`);
        fs.writeFileSync(lessCSS, fontMeta.join("\n"));
    }
    
    private writeCSS(map: any) {
        let ts = new Date().getTime();
        //write config file
    
        //write CSS identifiers file
        let cssIds = [];
        cssIds.push(`/* character CSS identifiers for ${map.font.fontname} font */`);
        cssIds.push("");
    
        for (let glyph of map.glyphs) {
            const json = JSON.stringify(glyph.code).replace(/[\u0080-\uFFFF]/g, function(m) {
                return "\\" + ("0000" + m.charCodeAt(0).toString(16)).slice(-4);
            })
            let cssId = `.${glyph.cssClass}:before { content: ${json}; } /* '${glyph.code}' */`;
            cssIds.push(cssId);
        }
    
        let fontMeta = [];
        fontMeta.push(`/* CSS declaration file for ${map.font.fontname} font */`);
        fontMeta.push("");
        fontMeta.push("@font-face {");
        //     //map.font.fontname
        fontMeta.push(`    font-family: '${map.font.fontname}';`);
        fontMeta.push(`    src: url('${map.font.fontname}.eot?${ts}');`); //timestamp
        fontMeta.push(`    src: url('${map.font.fontname}.eot?${ts}#iefix') format('embedded-opentype'),`);
        fontMeta.push(`        url('${map.font.fontname}.woff?${ts}') format('woff'),`);
        fontMeta.push(`        url('${map.font.fontname}.woff2?${ts}') format('woff2'),`);
        fontMeta.push(`        url('${map.font.fontname}.ttf?${ts}') format('truetype'),`);
        fontMeta.push(`        url('${map.font.fontname}.svg?${ts}#${map.font.fontname}') format('svg');`);
        fontMeta.push(`    font-weight: ${map.font.weight};`);
        fontMeta.push(`    font-style: ${map.font.style};`);
        fontMeta.push("}");
        fontMeta.push("");
        fontMeta.push(`[class^=\"${map.font.prefix}\"]:before, [class*=\" ${map.font.prefix}\"]:before {`);
        fontMeta.push(`    font-family: \"${map.font.fontname}\";`);
        fontMeta.push(`    font-style: ${map.font.style};`);
        fontMeta.push(`    font-weight: ${map.font.weight};`);
        fontMeta.push("    speak: none;");
        fontMeta.push("");
        fontMeta.push("    display: inline-block;");
        fontMeta.push("    text-decoration: inherit;");
        fontMeta.push("    text-align: center;");
        fontMeta.push("");
        fontMeta.push("    /* For safety - reset parent styles, that can break glyph codes*/");
        fontMeta.push("    font-variant: normal;");
        fontMeta.push("    text-transform: none;");
        fontMeta.push("");
        //fontMeta.push("    /* fix buttons height, for twitter bootstrap */");
        //fontMeta.push(util.format("    line-height: %s;", map.font.lineHeight ?? "1em"));
        fontMeta.push("");
        fontMeta.push("    /* Font smoothing. That was taken from TWBS */");
        fontMeta.push("    -webkit-font-smoothing: antialiased;");
        fontMeta.push("    -moz-osx-font-smoothing: grayscale;");
        fontMeta.push("}");
        fontMeta.push("");
        //container styles
        fontMeta.push(`[class^=\"${map.font.prefix}\"], [class*=\" ${map.font.prefix}\"] {`);
        fontMeta.push("    display: inline-block;");
        fontMeta.push("    text-align: center;");
        fontMeta.push("}");
        fontMeta.push("");
    
        fontMeta.push("/* Font icons declared */");
        fontMeta.push(cssIds.join("\n"));
    
        let css = path.resolve(path.join(map.targetDir, `${map.font.fontname}.css`));
        this.log(`Writing CSS Definition file '${css}'`);
        fs.writeFileSync(css, fontMeta.join("\n"));
    }
    
    public async go(sourceDir: string, targetDir: string): Promise<void> {
        return (new Promise<void>((resolve, reject) => {
            this.log(`Source directory: ${sourceDir}`);
            this.log(`Target directory: ${targetDir}`);
        
            this.log(this.gray("Reading configuration and generating metadata..."));
            const map = this.generateMap(sourceDir, targetDir);

            this.log(this.yellow("Glyphs found:"));
            for (let glyph of map.glyphs) {
                this.log(this.blue(`   ${glyph.file}`));
            }

            this.log(this.gray(`Found '${map.glyphs.length}' files, starting generation...`));

            const self = this;

            const svgtofont = require("svgtofont");
            
            svgtofont({
                src: sourceDir, // svg path
                dist: targetDir, // output path
                fontName:map.font.fontname,
                css: false, // Create CSS files.
                startUnicode: map.font.startcode, // unicode start number
                generateInfoData: false, 
                svgicons2svgfont: {
                    fontHeight: 1000,
                    normalize: true
                }
            }).then(() => {

                    self.log("Fonts generated. Writing config files...");

                    self.writeLESS(map);
                    self.writeCSS(map);
                    self.writeIndex(map);

                    self.writeConfig(map);

                    self.log("Fonts, CSS, LESS and Index generated!");

                    self.log("");
                    self.log(self.yellow("Available icons to use with tasks:"));
                    for (let glyph of map.glyphs) {
                        if (glyph.cssClass.indexOf("-lg-") !== -1) {
                            self.log(self.blue(`   ${glyph.cssClass}`));
                        }
                    }

                    resolve();
            });

            // TODO: Change this to some other lib!
            // var webfontsGenerator: any = require("webfonts-generator");
            // webfontsGenerator({
            //     files: map.glyphs.map(function (e: any) { return e.src; }),
            //     dest: targetDir,
            //     types: ["svg", "ttf", "woff", "woff2", "eot"],
            //     startCodepoint: map.font.startcode,
            //     fontName: map.font.fontname,
            //     rename: function(path: string) {
            //         // find file meta
            //         let file = map.glyphs.find(function(f: any) {return f.src == path});
            //         return file.cssClass;
            //     }
            // }, function(error: any) {
            //     if (error) {
            //         reject(error);
            //     } else {
                
            //         self.log("Fonts generated. Writing config files...");

            //         self.writeLESS(map);
            //         self.writeCSS(map);
            //         self.writeIndex(map);

            //         self.log("Fonts, CSS, LESS and Index generated!");

            //         self.log("");
            //         self.log(self.yellow("Available icons to use with tasks:"));
            //         for (let glyph of map.glyphs) {
            //             if (glyph.cssClass.indexOf("-lg-") !== -1) {
            //                 self.log(self.blue(`   ${glyph.cssClass}`));
            //             }
            //         }

            //         resolve();
            //     }
            // });
        }));
    }
}
