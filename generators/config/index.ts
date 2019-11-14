import { ConnectIoTGenerator, ValueType } from "../base";
import chalk from "chalk";

class GeneratorConfig extends ConnectIoTGenerator {

    private values: any = {
        fileName: "config.json",
        managerId: "Manager01",
        cache: this.destinationPath("cache").replace(/\\/g, "/"),
        monitorApplication: this.destinationPath("cache").replace(/\\/g, "/")+ "/MonitorApplication/src/index.js",

        repository: "NPM",
        npm: {
            url: "http://127.0.0.1:4873/",
            tokenType: "Bearer",
            token: "",
        },
        directory: {
            path: this.destinationPath("repository").replace(/\\/g, "/"),
        },

        system: {
            tenantName: "CoreDevelopment",
            address: "localhost",
            port: 9083,
            timeout: 60000,
            useSsl: false,
            isLoadBalancingEnabled: false,
            authentication: {
                type: "Password",
                settings: {
                }
            }
        },

        logging: []
    };

    constructor(args: any, opts: any) {
        super(args, opts);
       
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
    
    }

    /**
     * Will prompt the user about all settings
     */
    // https://www.npmjs.com/package/inquirer
    async prompting() {

        // Basic information request
        this.values.managerId = await this.askScalar("What is the Automation Manager Id?", ValueType.Text, this.values.managerId);
        this.values.monitorApplication = await this.askScalar("Where is the monitor application installed (full path to index.js)?", ValueType.Text, this.values.monitorApplication);

        // Repository
        this.log("");
        this.log(chalk.bold.bgCyan("Repository settings"));
        this.values.cache = await this.askScalar("Where is the cache located (downloaded packages)?", ValueType.Text, this.values.cache);

        this.values.repository = await this.askChoice("Where is the repository type?", ["NPM", "Directory"], this.values.repository);
        if (this.values.repository === "NPM") {
            this.values.npm.url = await this.askScalar("   What is the repository URL?", ValueType.Text, this.values.npm.url);
            this.values.npm.tokenType = await this.askChoice("  What is the Repository Token type?", ["None", "Bearer"], this.values.npm.tokenType);

            if (this.values.npm.tokenType === "Bearer") {
                this.values.npm.token = await this.askScalar("  What is the Repository Token value?", ValueType.Text, this.values.npm.token);
            }
        } else if (this.values.repository === "Directory") {
            this.values.directory.path = await this.askScalar("  What is the disk path where the repository is located?", ValueType.Text, this.values.directory.path);
        }

        // System
        this.log("");
        this.log(chalk.bold.bgCyan("System settings"));
        this.values.system.tenantName = await this.askScalar("What is the Tenant Name?", ValueType.Text, this.values.system.tenantName);
        this.values.system.isLoadBalancingEnabled = Boolean(await this.askScalar("Is host running in Load balancing?", ValueType.Confirm, this.values.system.isLoadBalancingEnabled));
        this.values.system.address = await this.askScalar("What is the MES host address?", ValueType.Text, this.values.system.address);
        this.values.system.port = Number(await this.askScalar("What is the MES host port?", ValueType.Text, this.values.system.port));
        this.values.system.useSsl = Boolean(await this.askScalar("Are REST calls using SSL?", ValueType.Confirm, this.values.system.useSsl));
        this.values.system.timeout = Number(await this.askScalar("What is the REST calls timeout?", ValueType.Text, this.values.system.timeout));

        this.values.system.authentication.type = await this.askChoice("What is the authentication type?", ["Password", "SecurityPortal"], this.values.system.authentication.type);
        if (this.values.system.authentication.type === "Password") {
            this.values.system.authentication.settings.domain = await this.askScalar("  What is the user Domain name?", ValueType.Text, "DOMAIN");
            this.values.system.authentication.settings.username = await this.askScalar("  What is the user name?", ValueType.Text, "user");
            this.values.system.authentication.settings.password = await this.askScalar("  What is the user password?", ValueType.Password, "pass");
        } else if (this.values.system.authentication.type === "SecurityPortal") {
            this.values.system.authentication.settings.clientId = await this.askScalar("  What is the Id of the client?", ValueType.Text, "MES");
            this.values.system.authentication.settings.accessToken = await this.askScalar("  What is the generated long term Access Token?", ValueType.Text, "");
            this.values.system.authentication.settings.openIdConfiguration = await this.askScalar("  What is the Security Portal OpenId address?", ValueType.Text, `http://${this.values.system.address}:11000/tenant/${this.values.system.tenantName}/.well-known/openid-configuration`);
        }

        // Log Transports
        this.log("");
        this.log(chalk.bold.bgCyan("Loggers"));
        if (await this.askScalar("Do you want to define loggers?", ValueType.Confirm, true) === true) {
            await this.askForTransports(true);
        }


        this.values.fileName = await this.askScalar("What is the filename to save?", ValueType.Text, this.values.fileName);
    }

    // For some reason, this is called by the yo engine, unless, it has the parameter set to false...
    private async askForTransports(askAnother: boolean = false) {
        while (askAnother === true) {
            const transport: any = {
                id: Math.floor(Math.random() * 99999),
                type: "File",
                options: {
                    level: "info",
                },
                applications: []
            };

            transport.type = await this.askChoice("What is the Logger type?", ["Console", "File"], transport.type);
            transport.id = await this.askScalar("  Define a unique identifier for this logger:", ValueType.Text, transport.id);
            transport.options.level = await this.askChoice("What is the Logger verbosity?", ["debug", "info", "warn", "error"], transport.options.level);

            if (transport.type === "Console") {
                // Console specific questions
            } else if (transport.type === "File") {
                // File specific questions
                this.log(chalk.bold.gray(" [Help] Tokens that can be used as filepath: ${applicationName}, ${entityName}, ${date}, ..."));
                transport.options.filename = await this.askScalar("What is the file name (tokens can be used)?", ValueType.Text, "");
                transport.options.dirname = await this.askScalar("Directory where to write the logs (tokens can be used)?", ValueType.Text, "");
                transport.options.maxSize = await this.askScalar("Max size per file (number or use size units like m, k, g)?", ValueType.Text, "10m");
                transport.options.maxFiles = await this.askScalar("Max number of files to keep (number or use date units like m, d, h, etc)?", ValueType.Text, "30d");
            } else if (transport.type === "Http") {
                // Http specific questions
            }

            if (await this.askScalar("Do you want to restrict packages that use this logger?", ValueType.Confirm, false) === true) {
                transport.applications = await this.askMultipleChoices("What are the packages (multiple choices)?", [
                    "AutomationManager",
                    "AutomationMonitor",
                    "AutomationController",
                    "DriverBle",
                    "DriverMqtt",
                    "DriverOpcDA",
                    "DriverOpcUa",
                    "DriverSecsGem",
                    "Driver*",
                ],
                    transport.applications);
            } else {
                // All apps
                transport.applications.push("*");
            }

            this.values.logging.push(transport);
            askAnother = await this.askScalar("Do you want to define more loggers?", ValueType.Confirm, false);
        }
    }

    /**
     * Will copy the templates for the framework tailoring all the files with the base framework it's extending from.
     */
    copyTemplates() {

        const configData: any = {};
        configData.id = this.values.managerId;
        configData.cache = this.values.cache;
        configData.hostName = "localhost";

        // Repository section
        configData.repository = {};
        if (this.values.repository === "NPM") {
            configData.repository.type = "Npm";
            configData.repository.settings = {
                url: this.values.npm.url
            };
            if (this.values.npm.tokenType === "Bearer") {
                configData.repository.settings.tokenType = this.values.npm.tokenType;
                configData.repository.settings.token = this.values.npm.token;
            }
        } else if (this.values.repository === "Directory") {
            configData.repository.type = "Directory";
            configData.repository.settings = {
                path: this.values.folder.path,
            }
        }

        configData.system = this.values.system;

        configData._storage = {
            type: "Directory",
            settings: {
                path: "c:/Persistency",
                retentionTime: 0
            }
        };

        configData.logging = this.values.logging;

        const destinationFile = this.destinationPath(this.values.fileName);

        this.fs.writeJSON(destinationFile, configData);

    }

    install() {
    }

    end() {
    }
}

declare var module: any;
(module).exports = GeneratorConfig;
