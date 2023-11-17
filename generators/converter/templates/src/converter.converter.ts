import { Converter, DI, Dependencies, TYPES, Task } from "@criticalmanufacturing/connect-iot-controller-engine";

/**
 * @whatItDoes
 *
 * >>TODO: Add description
 *
 */
@Converter.Converter()
export class <%= className %>Converter implements Converter.ConverterInstance<<%= inputAsJS %>, <%= outputAsJS %>> {

    @DI.Inject(TYPES.Dependencies.Logger)
    private _logger: Dependencies.Logger;

    /**
     * >>TODO: Enter description here!
     * @param value <%= inputAsJS %> value
     * @param parameters Transformation parameters
     */
    transform(value: <%= inputAsJS %>, parameters: { [key: string]: any; }): <%= outputAsJS %> {

        // >>TODO: Add converter code
        this._logger.error("The code for the converter was not yet developed");
        throw new Error(">>TODO: Not implemented yet")

    }

}
