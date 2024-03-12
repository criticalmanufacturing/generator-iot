import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Log } from "./processors/log";
import { Paths } from "./processors/paths";
import { DriverTemplatesProcessor } from "./processors/driverTemplates";
import { LibraryTemplatesProcessor } from "./processors/libraryTemplates";
import { ShrinkwrapGenerator } from "./processors/shrinkwrapGenerator";


const container = new Container();
container.bind<Container>(TYPES.Injector).toConstantValue(container);

container.bind<Log>(TYPES.Logger).to(Log).inSingletonScope();
container.bind<Paths>(TYPES.Paths).to(Paths).inSingletonScope();

container.bind<DriverTemplatesProcessor>(TYPES.Processors.DriverTemplates).to(DriverTemplatesProcessor).inSingletonScope();
container.bind<LibraryTemplatesProcessor>(TYPES.Processors.LibraryTemplates).to(LibraryTemplatesProcessor).inSingletonScope();
container.bind<ShrinkwrapGenerator>(TYPES.Processors.ShrinkwrapGenerator).to(ShrinkwrapGenerator).inSingletonScope();

export { container };
