import { Converter, DI, Dependencies, TYPES, Task } from "@criticalmanufacturing/connect-iot-controller-engine";
import i18n from "./i18n/<%= name %>.default";

/**
 * @whatItDoes
 *
 * >>TODO: Add description
 *
 */
@Converter.Converter({
    name: i18n.TITLE,
    input: <%= inputAsIoT %>,
    output: <%= outputAsIoT %>,
    parameters: {
<%- parametersAsJS %>
    },
})
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
        throw new Error(">>TODO: Not implemented yet")

    }

}
