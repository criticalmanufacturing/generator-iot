import "reflect-metadata";

import * as sinon from "sinon";

import { Container } from "inversify";
import * as path from "path";
import * as io from "fs-extra";
import { Log } from "./../processors/log";
import { Transpiler } from "../processors/transpiler";
import { TYPES } from "../types";

import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Transpiler", () => {
    let container: Container;
    let transpiler: Transpiler;
    let transpileStub: sinon.SinonStub;
    let readFileSyncStub: sinon.SinonStub;

    // Mocked dependencies
    let logStub: sinon.SinonStubbedInstance<Log>;

    beforeEach(() => {
        container = new Container();
        // Create mocks
        logStub = sinon.createStubInstance(Log);
        // Bind mocks to the container
        container.bind<Log>(TYPES.Logger).toConstantValue(logStub);
        // Bind the processor
        container.bind<Transpiler>(Transpiler).toSelf();

        // Get an instance of the processor
        transpiler = container.get(Transpiler);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should return the original value when value is null", async () => {

        transpileStub = sinon.stub(transpiler, "transpile");
        readFileSyncStub = sinon.stub(io, "readFileSync");

        const result = await transpiler.preProcessTaskScripts("dummy/path", null);
        expect(result).to.be.null;
        expect(logStub.debug.called).to.be.false;
    });

    it("should process a single script match", async () => {
        const value = "${script(some/path/to/script.ts)}";
        const templateDirectory = "/template/directory";
        const dummyScriptContent = "dummy-script-content";
        const transpileResult = "transpiled-code";

        transpileStub = sinon.stub(transpiler, "transpile");
        readFileSyncStub = sinon.stub(io, "readFileSync").returns(dummyScriptContent);
        transpileStub.resolves(transpileResult);

        const result = await transpiler.preProcessTaskScripts(templateDirectory, value);

        expect(result).to.equal(Buffer.from(transpileResult).toString("base64"));
        expect(readFileSyncStub.calledWith(path.resolve(templateDirectory, "some/path/to/script.ts"))).to.be.true;
        expect(transpileStub.calledWith(dummyScriptContent, false)).to.be.true;
        expect(logStub.debug.calledOnce).to.be.true;
    });

    it("should process a script array match", async () => {
        const value = "${script[](some/path/to/scripts.ts)}";
        const templateDirectory = "/template/directory";
        const dummyScriptContent = "dummy-script-content";
        const transpileResult = "line1\nline2\nline3";

        transpileStub = sinon.stub(transpiler, "transpile").resolves(transpileResult);
        readFileSyncStub = sinon.stub(io, "readFileSync").returns(dummyScriptContent);

        const result = await transpiler.preProcessTaskScripts(templateDirectory, value);

        expect(result).to.deep.equal(["line1", "line2", "line3"]);
        expect(readFileSyncStub.calledWith(path.resolve(templateDirectory, "some/path/to/scripts.ts"))).to.be.true;
        expect(transpileStub.calledWith(dummyScriptContent, false)).to.be.true;
        expect(logStub.debug.calledOnce).to.be.true;
    });

    it("should recursively process an array of values", async () => {
        const value = ["${script(some/path/script1.ts)}", "${script(some/path/script2.ts)}"];
        const templateDirectory = "/template/directory";

        transpileStub = sinon.stub(transpiler, "transpile").resolves("transpiled-code");
        readFileSyncStub = sinon.stub(io, "readFileSync").returns("dummy-script-content");

        const result = await transpiler.preProcessTaskScripts(templateDirectory, value);

        expect(result).to.deep.equal([
            Buffer.from("transpiled-code").toString("base64"),
            Buffer.from("transpiled-code").toString("base64"),
        ]);
        expect(readFileSyncStub.calledTwice).to.be.true;
        expect(transpileStub.calledTwice).to.be.true;
        expect(logStub.debug.calledTwice).to.be.true;
    });

    it("should recursively process an object with values", async () => {
        const value = {
            key1: "${script(some/path/script1.ts)}",
            key2: "TestScript",
        };
        const templateDirectory = "/template/directory";

        transpileStub = sinon.stub(transpiler, "transpile").resolves("transpiled-code");
        readFileSyncStub = sinon.stub(io, "readFileSync").returns("dummy-script-content");

        const result = await transpiler.preProcessTaskScripts(templateDirectory, value);

        expect(result).to.deep.equal({
            key1: Buffer.from("transpiled-code").toString("base64"),
            key2: "TestScript",
        });
        expect(readFileSyncStub.calledOnce).to.be.true;
        expect(transpileStub.calledOnce).to.be.true;
        expect(transpileStub.calledWithExactly("dummy-script-content", false)).to.be.true;
        expect(logStub.debug.calledOnce).to.be.true;
    });

    it("should process only values inside token", async () => {
        const value = {
            key1: "${script(some/path/script1.ts)}",
            key2: "TestScript",
        };
        const templateDirectory = "/template/directory";

        transpileStub = sinon.stub(transpiler, "transpile").resolves("transpiled-code");
        readFileSyncStub = sinon.stub(io, "readFileSync").returns("*********// PackagePacker: Start of Script\r\ndummy-script-content\r\n// PackagePacker: End of Script\r\n*********");

        const result = await transpiler.preProcessTaskScripts(templateDirectory, value);

        expect(result).to.deep.equal({
            key1: Buffer.from("transpiled-code").toString("base64"),
            key2: "TestScript",
        });
        expect(readFileSyncStub.calledOnce).to.be.true;
        expect(transpileStub.calledOnce).to.be.true;
        expect(transpileStub.calledWithExactly("dummy-script-content", false)).to.be.true;
        expect(logStub.debug.calledOnce).to.be.true;
    });

    it("should process only values inside the async token", async () => {
        const value = {
            key1: "${script(some/path/script1.ts)}",
            key2: "TestScript",
        };
        const templateDirectory = "/template/directory";

        transpileStub = sinon.stub(transpiler, "transpile").resolves("transpiled-code");
        readFileSyncStub = sinon.stub(io, "readFileSync").returns("*********// PackagePacker: Start of Async Script\r\ndummy-script-content\r\n// PackagePacker: End of Async Script\r\n*********");

        const result = await transpiler.preProcessTaskScripts(templateDirectory, value);

        expect(result).to.deep.equal({
            key1: Buffer.from("transpiled-code").toString("base64"),
            key2: "TestScript",
        });
        expect(readFileSyncStub.calledOnce).to.be.true;
        expect(transpileStub.calledOnce).to.be.true;
        expect(transpileStub.calledWithExactly("(async () => {\r\ndummy-script-content\r\n})();", false)).to.be.true;
        expect(logStub.debug.calledOnce).to.be.true;
    });

    it("should handle strings with no script match", async () => {
        const value = "plain string";

        transpileStub = sinon.stub(transpiler, "transpile");
        readFileSyncStub = sinon.stub(io, "readFileSync");

        const result = await transpiler.preProcessTaskScripts("dummy/path", value);
        expect(result).to.equal(value);
        expect(readFileSyncStub.called).to.be.false;
        expect(transpileStub.called).to.be.false;
        expect(logStub.debug.called).to.be.false;
    });

    it("should handle invalid script path gracefully", async () => {
        const value = "${script(invalid/path)}";
        const templateDirectory = "/template/directory";

        transpileStub = sinon.stub(transpiler, "transpile");
        readFileSyncStub = sinon.stub(io, "readFileSync");

        readFileSyncStub.throws(new Error("File not found"));

        await expect(
            transpiler.preProcessTaskScripts(templateDirectory, value)
        ).to.be.rejectedWith("File not found");

        expect(readFileSyncStub.calledOnce).to.be.true;
        expect(transpileStub.called).to.be.false;
        expect(logStub.debug.calledOnce).to.be.true;
    });
});
