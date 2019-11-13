import "reflect-metadata";
import { Container } from "inversify";

import { DeviceDriver, TYPES as COMMUNICATION_TYPES, container as driverContainer } from "@criticalmanufacturing/connect-iot-driver";
import { TYPES } from "./types";
import { <%= identifier %>DeviceDriver } from "./driverImplementation";

const container = new Container();
container.parent = driverContainer;
container.parent.bind<Container>(TYPES.Injector).toConstantValue(container);

// Must place in parent otherwise the driver(common) will not find this
container.parent.bind<DeviceDriver>(COMMUNICATION_TYPES.Device.Driver).to(<%= identifier %>DeviceDriver).inSingletonScope();

export { container };
