export const TYPES = {
    Injector: Symbol("Injector"),

    Logger: Symbol("Logger"),
    Paths: Symbol("Paths"),
    Transpiler: Symbol("Transpile"),

    Processors: {
        DriverTemplates: Symbol("DriverTemplatesProcessor"),
        LibraryTemplates: Symbol("LibraryTemplatesProcessor"),
        LibraryBusinessScenarios: Symbol("LibraryBusinessScenarios"),
        LibraryFontProcessor: Symbol("LibraryFontProcessor"),
        ShrinkwrapGenerator: Symbol("ShrinkwrapGenerator"),
    }
};
