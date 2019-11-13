import { PackageMetadata, Metadata } from "@criticalmanufacturing/connect-iot-controller-engine";

declare var SystemJS;

export default <PackageMetadata>{
    name: "<%= packageName %>",
    version: "",
    tasks: [
    ],
    converters: [
    ],
    fonts: [
        // Example for a custom font usage:
        /*{
            name: "myCustomFont",
            path: "../font/"
        }*/
    ],
    async onLoad(platform: Metadata.Platform): Promise<void> {
        // If the tasks have dependencies that are required to run in the browser, describe them here
        // according to the following examples:
        /*
        if (platform === Metadata.Platform.Browser) {
            SystemJS.config({
                paths: {
                    "buffer": "node_modules/buffer",
                    "base64-js": "node_modules/base64-js",
                    "ieee754": "node_modules/ieee754",
                    "mathjs": "node_modules/mathjs/dist",
                    "xmldom": "node_modules/xmldom",
                    "xpath": "node_modules/xpath"
                },
                packages: {
                    "buffer": {
                        main: "index.js",
                        format: "cjs"
                    },
                    "base64-js": {
                        main: "base64js.min.js",
                        format: "cjs"
                    },
                    "ieee754": {
                        main: "index.js",
                        format: "cjs"
                    },
                    "mathjs": {
                        main: "math.min.js",
                        format: "cjs"
                    },
                    "xmldom": {
                        main: "dom.js",
                        format: "cjs"
                    },
                    "xpath": {
                        main: "xpath.js",
                        format: "cjs"
                    }
                }
            });
        }*/
    }
};
