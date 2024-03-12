export const TYPES = {
    Injector: Symbol("Injector"),

    Logger: Symbol("Logger"),
    Paths: Symbol("Paths"),

    Processors: {
        DriverTemplates: Symbol("DriverTemplatesProcessor"),
        LibraryTemplates: Symbol("LibraryTemplatesProcessor"),
        ShrinkwrapGenerator: Symbol("ShrinkwrapGenerator"),
    }
};
