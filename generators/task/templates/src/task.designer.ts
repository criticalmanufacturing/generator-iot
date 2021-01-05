import { Task, Utilities } from "@criticalmanufacturing/connect-iot-controller-engine";
import { <%= className %>Settings } from "./<%= name %>.task";

@Task.Designer.TaskDesigner()
export class <%= className %>Designer implements Task.Designer.TaskDesignerInstance, <%= className %>Settings {

    // Add settings (this is just an example)
    inputs: Task.TaskInput[];
    outputs: Task.TaskOutput[];
    message: string;

    /**
     * Resolve the inputs to be displayed in the task during design time
     * @param inputs List of inputs automatically resolved.
     * Return the updated list of inputs to design
     */
    public async onGetInputs(inputs: Task.TaskInputs): Promise<Task.TaskInputs> {
<% if(hasInputs){ %>
        if (this.inputs) {
            for (const input of this.inputs) {
                inputs[input.name] = input.valueType;
                this[input.name] = input.defaultValue;
            }
        }
<% } %>
        return inputs;
    }

    /**
     * Resolve the outputs to be displayed in the task during design time
     * @param outputs List of outputs automatically resolved.
     * Return the updated list of outputs to design
     */
    public async onGetOutputs(outputs: Task.TaskOutputs): Promise<Task.TaskOutputs> {
<% if(hasOutputs){ %>
        let outputName: string;
        if (this.outputs) {
            for (const output of this.outputs) {
                outputName = Utilities.propertyToOutput(output.name);

                if (output.valueType == null || output.valueType.friendlyName == null || output.valueType?.friendlyName.trim().length === 0) {
                    outputs[outputName] = Object.assign({}, output.valueType, { friendlyName: output.name });
                } else {
                    outputs[outputName] = output.valueType;
                }
            }
        }
<% } %>
        return outputs;
    }
}
