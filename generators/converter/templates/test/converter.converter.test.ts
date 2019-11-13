import "reflect-metadata";
import { Task, System, TYPES, DI, Converter } from "@criticalmanufacturing/connect-iot-controller-engine";
import EngineTestSuite from "@criticalmanufacturing/connect-iot-controller-engine/test";
import * as chai from "chai";
import { <%= className %>Converter } from "../../../../src/converters/<%= name %>/<%= name %>.converter";

describe("<%= title %> converter", () => {

    let converter: Converter.ConverterContainer;

    beforeEach(async () => {
        converter = await EngineTestSuite.createConverter({
            class: <%= className %>Converter
        });
    });

    it("should convert", async (done) => {
        /* Example int to string
        let result: string = await converter.execute(123, {
            parameter: "something"
        });

        chai.expect(result).to.equal("123");
        */
        done();
    });

});
