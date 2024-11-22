import "reflect-metadata";

import * as sinon from "sinon";

import { Container } from "inversify";
import { TYPES } from "../types";
import { LibraryBusinessScenariosProcessor } from "./../processors/libraryBusinessScenarios";
import { Log } from "./../processors/log";
import { Paths } from "./../processors/paths";
import { Transpiler } from "./../processors/transpiler";
import * as io from "fs-extra";

import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("LibraryBusinessScenariosProcessor", () => {
    let container: Container;
    let processor: LibraryBusinessScenariosProcessor;

    // Mocked dependencies
    let logStub: sinon.SinonStubbedInstance<Log>;
    let pathsStub: sinon.SinonStubbedInstance<Paths>;
    let transpilerStub: sinon.SinonStubbedInstance<Transpiler>;

    beforeEach(() => {
        container = new Container();

        // Create mocks
        logStub = sinon.createStubInstance(Log);
        pathsStub = sinon.createStubInstance(Paths);
        transpilerStub = sinon.createStubInstance(Transpiler);

        // Bind mocks to the container
        container.bind<Log>(TYPES.Logger).toConstantValue(logStub);
        container.bind<Paths>(TYPES.Paths).toConstantValue(pathsStub);
        container.bind<Transpiler>(TYPES.Transpiler).toConstantValue(transpilerStub);

        // Bind the processor
        container.bind<LibraryBusinessScenariosProcessor>(LibraryBusinessScenariosProcessor).toSelf();

        // Get an instance of the processor
        processor = container.get(LibraryBusinessScenariosProcessor);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should log processing message and read package.json", async () => {
        // Arrange
        const destination = "path/to/package.json";
        const mockJson = {
            criticalManufacturing: { businessScenarios: [] },
        };
        sinon.stub(io, "readJSONSync").withArgs(destination).returns(mockJson);
        sinon.stub(io, "writeFileSync");

        // Act
        await processor.process([], destination);

        // Assert
        expect(logStub.Info.calledWith(" [BusinessScenarios] Processing Business Scenarios")).to.be.true;
        expect((io.writeFileSync as sinon.SinonStub).calledOnce).to.be.true;
    });

    it("should throw an error if directory does not exist", async () => {
        // Arrange
        const destination = "path/to/package.json";
        const mockJson = {
            criticalManufacturing: { businessScenarios: [] },
        };

        const mockPath = "non/existent/path";
        pathsStub.transform.returns(mockPath);
        sinon.stub(io, "readJSONSync").withArgs(destination).returns(mockJson);
        sinon.stub(io, "existsSync").withArgs(mockPath).returns(false);

        // Act & Assert
        await expect(processor.process(mockPath, "path/to/package.json")).to.eventually.be.rejectedWith(
            ` [BusinessScenarios] Directory '${mockPath}' doesn't exist`
        );
    });

    it("should merge business scenarios from a valid directory", async () => {
        // Arrange
        const mockPath = "path/to/scenarios";
        const mockFiles = ["scenario1.json", "scenario2.json"];
        const mockScenario = { name: "TestScenario" };

        pathsStub.transform.returns(mockPath);
        sinon.stub(io, "existsSync").withArgs(mockPath).returns(true);
        sinon.stub(io, "readdirSync").withArgs(mockPath).returns(mockFiles as any);
        sinon.stub(io, "readJSONSync").
            callsFake((file: any, options?: io.JsonReadOptions) => {
                if (file.toString().includes("scenario1.json")) {
                    return mockScenario;
                }
                return {};
            });
        sinon.stub(io, "writeFileSync");

        // Act
        await processor.process(mockPath, "path/to/package.json");

        // Assert
        const businessScenarioMetadata = {
            criticalManufacturing: {
                businessScenarios: [{ name: "TestScenario" }]
            }
        };
        expect((io.writeFileSync as sinon.SinonStub).calledWith("path/to/package.json", JSON.stringify(businessScenarioMetadata, null, 2)), "utf8").to.be.true;
    });

    it("should merge add business scenarios from a valid directory", async () => {
        // Arrange
        const mockPath = "path/to/scenarios";
        const mockFiles = ["scenario1.json", "scenario2.json"];
        const mockScenario1 = { name: "TestScenario1" };
        const mockScenario2 = { name: "TestScenario2" };

        pathsStub.transform.returns(mockPath);
        sinon.stub(io, "existsSync").withArgs(mockPath).returns(true);
        sinon.stub(io, "readdirSync").withArgs(mockPath).returns(mockFiles as any);
        sinon.stub(io, "readJSONSync").
            callsFake((file: any, options?: io.JsonReadOptions) => {
                if (file.toString().includes("scenario1.json")) {
                    return mockScenario1;
                } else if (file.toString().includes("scenario2.json")) {
                    return mockScenario2;
                }
                return {};
            });
        sinon.stub(io, "writeFileSync");

        // Act
        await processor.process(mockPath, "path/to/package.json");

        // Assert
        const businessScenarioMetadata = {
            criticalManufacturing: {
                businessScenarios: [
                    { name: "TestScenario1" },
                    { name: "TestScenario2" }
                ]
            }
        };
        expect((io.writeFileSync as sinon.SinonStub).calledWith("path/to/package.json", JSON.stringify(businessScenarioMetadata, null, 2)), "utf8").to.be.true;
    });

    it("should handle index file with array of files", async () => {
        // Arrange
        const indexFile = "path/to/index.json";
        const mockIndex = ["file1.json", "file2.json"];
        const mockScenario = { name: "IndexedScenario" };

        pathsStub.transform.returns(indexFile);
        const readJSONSyncStub = sinon.stub(io, "readJSONSync");
        readJSONSyncStub.withArgs(indexFile).onFirstCall().returns(mockIndex);
        readJSONSyncStub.callsFake((file: any, options?: io.JsonReadOptions) => {
            if (file.toString().includes("file1.json")) {
                return mockScenario;
            }
            return {};
        });
        sinon.stub(io, "writeFileSync");

        // Act
        await processor.process([{ source: indexFile, type: "Index" } as any], "path/to/package.json");

        // Assert
        const businessScenarioMetadata = {
            criticalManufacturing: {
                businessScenarios: [
                    { name: "IndexedScenario" }
                ]
            }
        };
        expect((io.writeFileSync as sinon.SinonStub).calledWith("path/to/package.json", JSON.stringify(businessScenarioMetadata, null, 2)), "utf8").to.be.true;
    });

    it("should warn when merging duplicate business scenarios", async () => {
        // Arrange
        const destination = "path/to/package.json";
        const mockJson = {
            criticalManufacturing: {
                businessScenarios: [{ name: "DuplicateScenario" }],
            },
        };
        const newScenario = { name: "DuplicateScenario", otherProperty: "NewValue" };

        const readJSONSyncStub = sinon.stub(io, "readJSONSync");
        readJSONSyncStub.withArgs(destination).onFirstCall().returns(mockJson);
        readJSONSyncStub.withArgs(destination).onSecondCall().returns(newScenario);

        sinon.stub(io, "writeFileSync");
        pathsStub.transform.returns(destination);

        // Act
        await processor.process([{ source: "path/to/scenario.json", type: "Template" } as any], destination);

        // Assert
        expect(logStub.Warn.calledWith(sinon.match("Overwriting Business Scenario 'DuplicateScenario'"))).to.be.true;
    });
});
