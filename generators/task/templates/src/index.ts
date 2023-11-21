import { Task } from "@criticalmanufacturing/connect-iot-controller-engine";
import { <%= className %>Task } from "./<%= name %>.task";

@Task.TaskModule({
    task: <%= className %>Task,
})

export default class <%= className %>Module {

}
