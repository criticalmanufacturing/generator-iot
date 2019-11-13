import { Task, Dependencies, System, DI, TYPES, Utilities } from "@criticalmanufacturing/connect-iot-controller-engine";
import i18n from "./i18n/<%= name %>.default";


/**
 * @whatItDoes
 *
 * This task does something ... describe here
 *
 * @howToUse
 *
 * yada yada yada
 *
 * ### Inputs
 * * `any` : **activate** - Activate the task
 *
 * ### Outputs

 * * `bool`  : ** success ** - Triggered when the the task is executed with success
 * * `Error` : ** error ** - Triggered when the task failed for some reason
 *
 * ### Settings
 * See {@see <%= className %>Settings}
 */
@Task.Task({
    name: i18n.TITLE,
    iconClass: "<%= icon %>",
    inputs: {
        activate: Task.INPUT_ACTIVATE,

        // Add more inputs here
        // example: containerId: System.PropertyValueType.String,
    },
    outputs: {
        // Add more outputs here:
        // Example:  notifyMessage: System.PropertyValueType.String,
        success: Task.OUTPUT_SUCCESS,
        error: Task.OUTPUT_ERROR
    }<% if(isForProtocol === true) { %>,
    protocol: Task.TaskProtocol.All<% } %>
})
export class <%= className %>Task implements Task.TaskInstance, <%= className %>Settings {

    /** Accessor helper for untyped properties and output emitters. */
    [key: string]: any;

    /** **Inputs** */
    /** Activate task execution */
    public activate: any = undefined;
    // ... more inputs


    /** **Outputs** */
    /** To output a success notification */
    public success: Task.Output<boolean> = new Task.Output<boolean>();
    /** To output an error notification */
    public error: Task.Output<Error> = new Task.Output<Error>();


    /** Settings */
    /** Properties Settings */
    message: string;

    @DI.Inject(TYPES.Dependencies.Logger)
    private _logger: Dependencies.Logger;
<% if(isForProtocol === true) { %>
    @DI.Inject(TYPES.System.Driver)
    private _driverProxy: System.DriverProxy;<% } %>

    /**
     * When one or more input values is changed this will be triggered,
     * @param changes Task changes
     */
    async onChanges(changes: Task.Changes): Promise<void> {
        if (changes["activate"]) {
            // It is advised to reset the activate to allow being reactivated without the value being different
            this.activate = undefined;

            // ... code here
            this.success.emit(true);

            // or
            this._logger.error(`Something very wrong just happened! Log it!`);
            throw new Error ("Will stop processing, but Error output will be triggered with this value");
        }
    }

    /** Right after settings are loaded, create the needed dynamic outputs. */
    async onBeforeInit(): Promise<void> {
    }

    /** Initialize this task, register any event handler, etc */
    async onInit(): Promise<void> {
    }

    /** Cleanup internal data, unregister any event handler, etc */
    async onDestroy(): Promise<void> {
    }

    // On every tick (use instead of onChanges if necessary)
    // async onCheck(): Promise<void> {
    // }
}

// Add settings here
/** <%= className %> Settings object */
export interface <%= className %>Settings {
    message: string;
}
