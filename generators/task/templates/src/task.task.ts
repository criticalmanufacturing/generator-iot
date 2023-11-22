import { Task, Dependencies, System, DI, TYPES, Utilities } from "@criticalmanufacturing/connect-iot-controller-engine";

/** Default values for settings */
export const SETTINGS_DEFAULTS: <%= className %>Settings = {
    <%- settingsDefaults %>
}

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
@Task.Task()
export class <%= className %>Task implements Task.TaskInstance, <%= className %>Settings {

    /** Accessor helper for untyped properties and output emitters. */
    // [key: string]: any;

    /** **Inputs** */
    /** Activate task execution */
    public activate: any = undefined;

    <%- inputsInterface %>

    /** **Outputs** */
    /** To output a success notification */
    public success: Task.Output<boolean> = new Task.Output<boolean>();
    /** To output an error notification */
    public error: Task.Output<Error> = new Task.Output<Error>();

    <%- outputsInterface %>

    /** Properties Settings */
    <%= settingsInterface %>

    @DI.Inject(TYPES.Dependencies.Logger)
    private _logger: Dependencies.Logger;
<% if(isProtocol === true) { %>
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
            this.error.emit(new Error ("Will stop processing, but Error output will be triggered with this value"));
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
}

// Add settings here
/** <%= className %> Settings object */
export interface <%= className %>Settings extends System.TaskDefaultSettings {
    <%= settingsInterface %>
}
