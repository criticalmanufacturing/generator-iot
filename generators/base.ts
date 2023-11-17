import * as Generator from 'yeoman-generator';

export class ConnectIoTGenerator extends Generator {

    constructor(args: any, opts: any) {
        super(args, opts);

        // Disable the conflicts by forcing everything
        if ((<any>this).conflicter != null) {
            (<any>this).conflicter.force = true;
        }
    }

    /** Simply camel cases the passed in value. All parameters should follow this rule. */
    camelCaseValue(value: string) {
        return value[0].toLowerCase() + value.slice(1);
    }
    /** Simply pascal cases the passed in value. */
    pascalCaseValue(value: string) {
        return value[0].toUpperCase() + value.slice(1);
    }

    /**
     * Ask a question and retrieve the result
     * @param question Question to ask
     * @param type Value data type
     * @param def Default value
     */
    async askScalar(question: string, type: ValueType, def: any): Promise<any> {
        let valueType: string = "";

        switch (type) {
            case ValueType.Text: valueType = "input"; break;
            case ValueType.Confirm: valueType = "confirm"; break;
            case ValueType.Password: valueType = "password"; break;
        }

        let answer = await this.prompt([{
            type: valueType,
            name: "result",
            message: question,
            default: def,
        }]);

        return (answer.result);
    }

    /**
     * Ask for a choice of the IoT supported data types
     * @param question Question to ask
     * @param def Default value
     * @param allowEnum Should the Enum be a possibility
     */
    async askValueType(question: string, def: IoTValueType, allowEnum: boolean = false): Promise<IoTValueType> {
        let choices = ["Any", "String", "Integer", "Long", "Decimal", "Boolean", "DateTime", "Object", "Buffer"];
        if (allowEnum === true) {
            choices.push("Enum");
        }

        let answer = await this.prompt([{
            type: "list",
            name: "result",
            message: question,
            choices: choices,
            default: def,
        }]);

        return (<IoTValueType>(<any>IoTValueType)[answer.result]);
    }

    /**
     * Ask for a choice out of a set of choices
     * @param question Question to ask 
     * @param choices Available choices
     * @param def Default value
     */
    async askChoice(question: string, choices: string[], def: string): Promise<string> {
        let answer = await this.prompt([{
            type: "list",
            name: "result",
            message: question,
            choices: choices,
            default: def,
        }]);

        return (answer.result);
    }

    /**
     * Ask for one or more choices out of a set of possibilities
     * @param question Question to ask
     * @param choices Possible choices
     * @param def Default choices
     */
    async askMultipleChoices(question: string, choices: string[], def: string[]): Promise<string[]> {
        let answer = await this.prompt([{
            type: "checkbox",
            name: "result",
            message: question,
            choices: choices,
            default: def,
        }]);

        return (answer.result);
    }

    /**
     * Inject a value between two tokens. 
     * Useful to add code to existing code (with indentation)
     * @param file File to process
     * @param startToken Identifier of the start of the block
     * @param endToken Identifier of the end (will be appended before this token)
     * @param value Value to inject
     */
    injectInFile(file: string, startToken: string, endToken: string, value: string): any {
        let fileContent = this.fs.read(file).split("\r\n");
        let startIndex = -1;
        let endIndex = -1;
        let alreadyInjected = false;

        // search start
        fileContent.forEach((line, index) => {
            if (startIndex === -1 && line.trim().toLocaleLowerCase().includes(startToken.trim().toLocaleLowerCase())) {
                startIndex = index;
            }
            if (endIndex === -1 && startIndex !== -1 && line.trim().toLocaleLowerCase().includes(endToken.trim().toLocaleLowerCase())) {
                endIndex = index;
            }
            if (line.trim().toLocaleLowerCase().includes(value.trim().toLocaleLowerCase())) {
                alreadyInjected = true;
            }
        });

        if (startIndex !== -1 && endIndex !== -1) {
            // confirm prefix tabs
            if (startIndex !== endIndex) {
                let prefix: string = fileContent[startIndex + 1].trimRight();
                prefix = prefix.slice(0, prefix.length - prefix.trim().length);
                value = prefix + prefix + value.trim();
            }

            if (!alreadyInjected) {
                // inject and save
                fileContent.splice(endIndex, 0, value);
                this.fs.write(file, fileContent.join("\r\n"));
            }

        } else {
            this.log(`** ${file} doesn't contain the necessary tokens to insert ${value}`);
        }
    }
   
    /**
     * Return the JavaScript corresponding type for the IoT data type
     * @param type IoT data type to translate
     */    
    toJSType(type: IoTValueType): string {
        switch (type) {
            case IoTValueType.Any: return ("any");
            case IoTValueType.String: return ("string");
            case IoTValueType.Decimal:
            case IoTValueType.Long:
            case IoTValueType.Integer: return ("number");
            case IoTValueType.Object: return ("object");
            case IoTValueType.Buffer: return ("Buffer");
            case IoTValueType.Boolean: return ("boolean");
        }
        return ("notSupportedPleaseFix");
    }

    

     /**
     * Return the TypeScript name corresponding type for the IoT data type
     * @param type IoT data type to translate
     */  
    toIotType(type: IoTValueType): string {
        switch (type) {
            case IoTValueType.Any: return ("undefined");
        }
        return ("Task.TaskValueType." + type);
    }
}

/** Value type for the question */
export enum ValueType {
    /** Text entry (even if it is a number) */
    Text,
    /** Boolean entry (Y/N) */
    Confirm,
    /** Password entry (hidden) */
    Password,
}

/** IoT Data Types */
export enum IoTValueType {
    Any = "Any",
    String = "String",
    Integer = "Integer",
    Long = "Long",
    Decimal = "Decimal",
    Boolean = "Boolean",
    DateTime = "DateTime",
    Object = "Object",
    Buffer = "Buffer",
    Enum = "Enum",
}