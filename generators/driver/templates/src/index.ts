import * as yargs from "yargs";
import * as path from "path";
import * as io from "fs";
import { container } from "./inversify.config";
import { TYPES as COMMUNICATION_TYPES } from "@criticalmanufacturing/connect-iot-driver";
import { Runner } from "@criticalmanufacturing/connect-iot-driver";
import { TYPES as COMMON_TYPES, Logger, Utils, Communication } from "@criticalmanufacturing/connect-iot-common";


yargs.usage("Usage: $0 [options]").wrap(0);

// Id
yargs.option("id", { type: "string", description: "Unique identifier of the driver instance Id", required: true });
yargs.option("componentId", { type: "string", default: "", description: "Component Id of the Automation Instance", required: false });
yargs.option("entityName", { type: "string", default: "", description: "System entity name associated with the driver", required: false });

// Configuration file
yargs.option("config", { type: "string", default: "config.json", description: "Configuration file to use" });

// Monitor
yargs.option("monitorPort", { alias: "mp", type: "number", description: "Websocket port of monitor", required: true })
     .option("monitorHost", { alias: "mh", type: "string", default: "localhost", description: "websocket address (without port) of monitor" })
     .option("monitorToken", { alias: "mt", type: "string", default: "monitorSecurityToken", description: "Security token to communicate with monitor" });

// Controller link (server)
yargs.option("serverPort", { alias: "sp", type: "number", default: 0, description: "Websocket port (server) to communicate with controller" })
     .option("serverHost", { alias: "sh", type: "string", default: "localhost", description: "Websocket address (server) without port to communicate with controller" });

yargs.help("h").alias("h", "help");

// Start driver runner if all mandatory parameters are provided
let logger: Logger;
if (yargs.argv) {
    logger = container.get<Logger>(COMMON_TYPES.Logger);

    let configurationFile: string = <string>yargs.argv.config;
    if (!path.isAbsolute(configurationFile)) {
        configurationFile = path.join(__dirname, configurationFile);
    }

    // Prepare logger
    container.bind(COMMUNICATION_TYPES.ConfigurationFile).toConstantValue(configurationFile);
    logger.setIdentificationTokens({
        applicationName: "Driver<%= identifier %>",
        pid: process.pid,
        componentId: yargs.argv.componentId || "Driver<%= identifier %>",
        entityName: yargs.argv.entityName,
    });
    logger.setLogTransportsFromConfigurationFile(configurationFile);

    logger.info(`Starting <%= identifier %> driver with pid "${process.pid}".`);
    logger.debug(`Command line: ${Utils.objectToString(yargs.argv)}`);
    logger.info(`  ConfigurationFile='${configurationFile}'`);
    let configurationObject = undefined;
    let monitorSslConfig: Communication.SslConfig = Object.assign({}, Communication.sslConfigDefaults);
    let driversSslConfig: Communication.SslConfig = Object.assign({}, Communication.sslConfigDefaults);
    if (io.existsSync(configurationFile)) {
        configurationObject = JSON.parse(io.readFileSync(configurationFile, "utf8"));
        if (configurationObject) {
            if (configurationObject.processCommunication != null) {
                monitorSslConfig = Communication.validateSslConfig(Object.assign(monitorSslConfig, configurationObject.processCommunication.monitor || { }), true);
                driversSslConfig = Communication.validateSslConfig(Object.assign(driversSslConfig, configurationObject.processCommunication.driver || { }), true);
            }
        }
    }

    // Run Driver Runner (Connection with Monitor, and interface with controller)
    Runner.run({
        id: <string>yargs.argv.id,
        monitor: {
            reconnectInterval: 1000,
            host: <string>yargs.argv.monitorHost,
            port: <number>yargs.argv.monitorPort,
            securityToken: <string>yargs.argv.monitorToken,
            sslConfig: <Communication.SslConfig>monitorSslConfig
        },
        device: {
            controller: {
                buffering: 30000,
                serverHost: <string>yargs.argv.serverHost,
                serverPort: <number>yargs.argv.serverPort
            },
            sslConfiguration: <Communication.SslConfig>driversSslConfig
        }
    }).then(() => {
        logger.info(`<%= identifier %> Driver process started with success`);
    }).catch((error: Error) => {
        logger.error(`<%= identifier %> Driver process failed to start!`);
        logger.error(error.message);
        process.exit(1);
    });
}


process.on("uncaughtException", (error: Error) => {
    if (logger) {
        logger.emerg(`Unexpected error occurred: ${error.message}`);
        logger.emerg(`Trying to recover...`);
    }
});
