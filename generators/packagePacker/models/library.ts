export enum Scope {
    ConnectIoT = "ConnectIoT",
    FactoryAutomation = "FactoryAutomation",
    EnterpriseIntegration = "EnterpriseIntegration",
}

export enum TaskLifeCycle {
    Productive = "Productive",
    Experimental = "Experimental",
    Deprecated = "Deprecated",
}

export enum TaskInputTypeType {
    /** Same as using the value as string, but allowing the display name to be changed */
    Static = "Static",
    /** The Task activation input. Only one allowed */
    Activate = "Activate",
    /** Activation of the input auto ports functionality for this task */
    AutoPort = "AutoPort",
    /** The inputs can be added/removed  */
    Dynamic = "Dynamic",
}

export enum TaskOutputTypeType {
    /** Same as using the value as string, but allowing the display name to be changed */
    Static = "Static",
    /** The Task success output port emitted when it executed successfully. Only one allowed */
    Success = "Success",
    /** The task error output port which emits the error that occurred during execution */
    Error = "Error",
    /** Activation of the input auto ports functionality for this task */
    AutoPort = "AutoPort",
    /** The inputs can be added/removed  */
    Dynamic = "Dynamic",
}
/**
 * An Automation Task Library is a set of metadata that contains enough information to produce one or multiple
 * Tasks to be used in the Workflow Designer without requiring any code or development skills. It is also
 * intended to allow the user to see the settings of a task that was created in previous versions of the
 * installed system
 */
export interface Library {
    /** Name of the Tasks Package – Will be used to be displayed in the Workflow Designer */
    name: string;

    /** List of protocol drivers (separated by comma “,”) this library depends on to be available. Example: “@criticalmanufacturing/connect-iot-driver-oib”. Leave empty (default) for no dependency which means, available for all protocol drivers */
    dependsOnProtocol?: string[];

    /** List of scopes (separated by comma “,”) this library depends on to be available. Leave empty (default) for no dependency which means, available for all scopes */
    dependsOnScope?: Scope[];

    /** List of protocol drivers (separated by comma “,”) this library is mandatory and will be selected without option to unselect. Example: “@criticalmanufacturing/connect-iot-driver-oib”. Leave empty (default) for none */
    mandatoryForProtocol?: string[];

    /** List of scopes (separated by comma “,”) this library is mandatory and will be selected without option to unselect. Leave empty (default) for none */
    mandatoryForScope?: Scope[];

    metadata: LibraryMetadata;
}

/**
 * describe the format of the Metadata portion of the Tasks Library
 */
export interface LibraryMetadata {
    /** List of Converters available in this library version */
    converters?: LibraryConverter[];
    /** List of Tasks available in this library */
    tasks?: LibraryTask[];
    /** Font metadata */
    font?: any;
}

/** format of the Metadata portion that represents a single converter  */
export interface LibraryConverter {
    /** Name of the converter, also name of the Runtime Class where the converter code can be located/executed */
    name: string;
    /** Name of the converter that will be used to display in the GUI, defaults to Name if not defined */
    displayName?: string;
    // /**Name of the Runtime Class where the converter code can be located/executed */
    // class: string;
    /** Type of the input where this converter can act */
    inputDataType: string;
    /** Type of the output this converter will emit */
    outputDataType: string;
    /** Json object containing the parameters available to configure the behavior of the converter */
    parameters?: any;
}

export const LibraryConverterDefaults: LibraryConverter = {
    name: "",
    inputDataType: "Any",
    outputDataType: "Any",
};

export interface LibraryConverterParameter {
    /** Data type of the converter */
    dataType: string;
    /** Text to be displayed in the Gui, defaults to Name if not defined */
    displayName: string;
    /** Text to display in the hint box when hoovered */
    infoMessage?: string;
    /** Default value serialized */
    defaultValue: any;
    /** List of possible values when the dataType is Enum */
    enumValues?: string[] | { [label: string]: any }[];
}

export interface LibraryTask {
    /**	Name of the Task, will be used to display in the GUI, also name of the Runtime Class where the task code can be located/executed */
    name: string;
    /**	Name of the task that will be used to display in the GUI, defaults to Name if not defined */
    displayName: string;
    // /** Name of the Runtime Class where the task code can be located/executed */
    // class: string;
    /* Name of the icon if it was loaded as a font in the gui */
    iconClass?: string;
    /** Flag indicating if this ask is to be related with a protocol scope */
    isProtocol: boolean;
    /** Flag indicating if this task is to be related in a controller scope. Note: It is possible for a task to be usable in both Controller and Protocol scope (Code, EntityInstance, etc) */
    isController: boolean;
    /** Flag indicating the current lifecycle of this task */
    lifecycle: TaskLifeCycle;
    /**	Message to display to the user when a task is marked as Deprecated indicating the user what he should use instead. Note: Only used when Lifecyle != Productive */
    lifecycleMessage: string;
    /**	List of protocol drivers (separated by comma “,”) this task depends on to be available. Example: “@criticalmanufacturing/connect-iot-driver-oib”. Leave empty (default) for no dependency which means, available for all protocol drivers */
    dependsOnProtocol?: string[];
    /** List of scopes (separated by comma “,”) this task depends on to be available. Leave empty (default) for no dependency which means, available for all scopes */
    dependsOnScope?: Scope[];


    inputs?: { [key: string]: string | TaskInputType };
    outputs?: { [key: string]: string | TaskOutputType };
    settings?: { [key: string]: SettingsTab };

    scripts?: { [key: string]: LibraryTaskScript };
}

export enum LibraryTaskScriptType {
    /** Script block */
    Script = "Script",
    /** Points to a generic script instead of the script itself */
    Reference = "Reference",
    // JsonAta = 'JsonAta',
}

export enum LibraryTaskScriptEncoding {
    Plain = "Plain",
    Base64 = "Base64",
}

export interface LibraryTaskScript {
    type?: LibraryTaskScriptType;
    encoding?: LibraryTaskScriptEncoding;
    script: string | string[];
}

export const LibraryTaskDefaults: LibraryTask = {
    name: "",
    displayName: "",
    isProtocol: false,
    isController: false,
    lifecycle: TaskLifeCycle.Productive,
    lifecycleMessage: "",
    dependsOnProtocol: [],
    dependsOnScope: [Scope.ConnectIoT, Scope.FactoryAutomation, Scope.EnterpriseIntegration],
};

export interface TaskInputType {
    /** Type of input port */
    type: TaskInputTypeType;
    /** Data type of the input (used when Type is static) */
    dataType: string;
    /** Text to be displayed in the Gui, defaults to Name if not defined */
    displayName: string;
    /** Default value serialized */
    defaultValue: any;
}

export interface TaskOutputType {
    /** Type of input port */
    type: TaskOutputTypeType;
    /** Data type of the input (used when Type is static) */
    dataType: string;
    /** Text to be displayed in the Gui, defaults to Name if not defined */
    displayName: string;
}

export interface SettingsTab {
    [key: string]: SettingsSection;
}

export interface SettingsSection {
    [key: string]: SettingsSetting[];
}

export interface SettingsSetting {
    /** Name of the setting */
    name: string;
    /** Text to display in the Gui, defaults to Name if not defined */
    displayName?: string;
    /** Key of the settings where the value will be stored. Must be unique within the entire set of settings in the task */
    settingKey: string;
    /** Data type of the field (used to render) */
    dataType: string;
    /** Flag indicating if this setting must be filled */
    isMandatory?: boolean;
    /** List of possible values when the Type is Enum */
    enumValues?: string[] | { [label: string]: any }[];
    /** Text to display in the hint box when hoovered */
    infoMessage?: string;
    /** Value to use as default */
    defaultValue: any;
    /** Expression (Angular) that will be parsed to identify if this setting is to be displayed.
    Example:
    timerType != null && timerType !== “CronJob” */
    condition?: string;
    /** Extra settings to use to model the behavior of the field. These settings are different per control to use */
    settings?: any;
}