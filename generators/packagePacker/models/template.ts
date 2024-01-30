/** Possible action to perform on a template file */
export enum TemplateType {
    /** Index file */
    Index = "Index",
    /** Template */
    Template = "Template"
}

/** Files to use to build the templates entry in the Package.json file */
export interface Template {
    /** Template Type */
    type: TemplateType;
    /** Source file */
    source: string;
}

// Package.json specific!!!
export interface JsonTemplateProperty {
    Name: string;
    Description?: string;
    DevicePropertyId?: string;
    DataType: string;
    IsWritable?: boolean;
    IsReadable?: boolean;
    AutomationProtocolDataType: string;
    ExtendedData?: any;
}

export const JsonTemplatePropertyDefaults: JsonTemplateProperty = {
    Name: "",
    Description: "",
    DevicePropertyId: "",
    DataType: "String",
    IsWritable: true,
    IsReadable: true,
    AutomationProtocolDataType: "",
    ExtendedData: {}
};

export interface JsonTemplateEventProperty {
    Property: string;
    Order?: number;
    ExtendedData?: any;
}

export const JsonTemplateEventPropertyDefaults: JsonTemplateEventProperty = {
    Property: "",
    Order: -1,
    ExtendedData: {}
};

export interface JsonTemplateEvent {
    Name: string;
    Description?: string;
    DeviceEventId?: string;
    IsEnabled?: boolean;
    ExtendedData?: any;
    EventProperties?: JsonTemplateEventProperty[];
}

export const JsonTemplateEventDefaults: JsonTemplateEvent = {
    Name: "",
    Description: "",
    DeviceEventId: "",
    IsEnabled: true,
    ExtendedData: {},
    EventProperties: [],
};


export interface JsonTemplateCommand {
    Name: string;
    Description?: string;
    DeviceCommandId?: string;
    ExtendedData?: any;
    CommandParameters?: JsonTemplateCommandParameter[];
}

export const JsonTemplateCommandDefaults: JsonTemplateCommand = {
    Name: "",
    Description: "",
    DeviceCommandId: "",
    ExtendedData: {},
    CommandParameters: [],
};

export interface JsonTemplateCommandParameter {
    Name: string;
    Description?: string;
    Order?: number;
    DataType: string;
    AutomationProtocolDataType: string;
    DefaultValue?: string;
    IsMandatory?: boolean;
    ExtendedData?: any;
}

export const JsonTemplateCommandParameterDefaults: JsonTemplateCommandParameter = {
    Name: "",
    Description: "",
    Order: -1,
    DataType: "",
    AutomationProtocolDataType: "",
    DefaultValue: "",
    IsMandatory: true,
    ExtendedData: {}
};

export interface JsonTemplate {
    property?: JsonTemplateProperty[];
    event?: JsonTemplateEvent[];
    command?: JsonTemplateCommand[];
}

export interface JsonDatatype {
    name: string;
    description?: string;
}


