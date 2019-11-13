import { Task } from "@criticalmanufacturing/connect-iot-controller-engine";
import { <%= className %>Task } from "./<%= name %>.task";
import { <%= className %>Designer } from "./<%= name %>.designer";


@Task.TaskModule({
    task: <%= className %>Task,
    designer: <%= className %>Designer
})

export default class <%= className %>Module {

}
