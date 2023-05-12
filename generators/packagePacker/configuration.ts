import { Template } from "./models/template";

/** Type of package to process */
export enum ComponentType {
    /** Manager, Monitor, Controller, Driver */
    Component = "Component",
    /** Tasks package (must process the metadata file) */
    TasksPackage = "TasksPackage",
}

/** Possible action to perform */
export enum ActionType {
    /** Delete file */
    DeleteFile = "DeleteFile",
    /** Delete directory */
    DeleteDirectory = "DeleteDirectory",
    /** Copy entire directory contents */
    CopyDirectory = "CopyDirectory",
    /** Copy single file */
    CopyFile = "CopyFile",
    /** Move single file */
    MoveFile = "MoveFile",
    /** Rename single file */
    RenameFile = "RenameFile",
    /** Replace text with another one */
    ReplaceText = "ReplaceText",
}

/** Configuration structure */
export interface Configuration {
    /** Component Type */
    type: ComponentType;
    /** Packages to ignore */
    ignore?: string[];
    /** List of files to fully pack (will use src/index.js as default) */
    packs?: Pack[];
    /** Addons required for the package */
    addons?: Addon[];
    /** Templates used to generate the entry in package.json */
    templates?: Template[];
    /** List of actions to post perform */
    postActions?: Action[];
}

/** Action structure */
export interface Action {
    /** Type of action */
    type: ActionType;
    /** Action Source */
    source: string;
    /** Action Destination */
    destination?: string;
    /** Text to search */
    search?: string;
    /** Text to replace with */
    replace?: string;
    /** File to work */
    file?: string;
    /** Search is regular expression */
    isRegularExpression?: boolean;
}

/** Compiled version/platform specific node addon */
export interface Addon {
    /** Name of the addon (also directory where it is) */
    name: string;
    /** Version of the addon (also the subdirectory where it is) */
    version: string;
    /** Extension expected (*.node) */
    fileMask: string;
}

/** Files to pack (will use src/index.js is this section is missing) */
export interface Pack {
    /** Relative directory where the source file is */
    directory: string;
    /** Source file to pack (defaults to index.js) */
    source?: string;
    /** Destination name to use (defaults to index.js) */
    destination?: string;
}