import { ModelType } from "../util/types";
import AbstractNamedModelElement from "./AbstractNamedModelElement";

/**
 * A marker interface for an information element that is an assembly model type.
 */
export default abstract class AbstractAssembly extends AbstractNamedModelElement {
    /**
     * Provides the Metaschema model type of `ASSEMBLY`.
     * 
     * @returns the model type
     */
    getModelType(): ModelType {
        return ModelType.ASSEMBLY;
    }
}
