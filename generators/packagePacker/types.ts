export const TYPES = {
    Injector: Symbol("Injector"),

    Logger: Symbol("Logger"),
    Paths: Symbol("Paths"),

    Processors: {
        DriverTemplates: Symbol("DriverTemplatesProcessor"),
        LibraryTemplates: Symbol("LibraryTemplatesProcessor"),
        LibraryFontProcessor: Symbol("LibraryFontProcessor"),
        ShrinkwrapGenerator: Symbol("ShrinkwrapGenerator"),
    }
};
