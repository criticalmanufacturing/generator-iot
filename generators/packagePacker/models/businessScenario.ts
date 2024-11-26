/**
 * Representation of a business scenario step
 */
export interface BusinessScenarioStep {
    /** Unique name of the step within the Scenario */
    name: string;
    /** Type of step */
    type: string;
    /** Specific settings depending on the type */
    settings?: any;
    /** Next step to execute. May be a step, a set of steps, a condition, etc */
    next?: string;
    /** Key name to use to store the result of this step */
    resultKey?: string;
}

/**
 * Representation of a business scenario metadata
 */
export interface BusinessScenarioMetadata {
    /** Name of the scenario. Should be unique within the system */
    name: string;
    /** Some more details about the scenario itself and what it does */
    description?: string;
    /** Initial step to start the execution */
    start: string;
    /** Optional step to execute when no more steps are left in the start execution */
    finally?: string;
    /** Optional step to execute/commit the result of the scenario. It is important to use this when a `resultType` is defined and therefore asking the user before changing the system */
    end?: string;
    /** Configured steps to execute */
    steps: BusinessScenarioStep[];
    /** Type of result expected to result from this scenario. Used to generate some steps after the end flow */
    resultType?: string;
}

/**
 * Representation of a business scenario
 */
export interface BusinessScenario {
    name: string;
    description: string;
    scopes: string;
    conditionType: string;
    condition: string;
    metadata: BusinessScenarioMetadata
}