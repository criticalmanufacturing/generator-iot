import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Log } from "./processors/log";
import { Paths } from "./processors/paths";
import { TemplatesProcessor } from "./processors/templates";


const container = new Container();
container.bind<Container>(TYPES.Injector).toConstantValue(container);

container.bind<Log>(TYPES.Logger).to(Log).inSingletonScope();
container.bind<Paths>(TYPES.Paths).to(Paths).inSingletonScope();

container.bind<TemplatesProcessor>(TYPES.Processors.Templates).to(TemplatesProcessor).inSingletonScope();

export { container };
