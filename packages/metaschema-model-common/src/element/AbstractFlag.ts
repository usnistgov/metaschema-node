import AbstractNamedModelElement from "./AbstractNamedModelElement";
import { ModelType } from "../util/types";

/**
 * A marker interface for an information element that is an flag model type.
 */
export default abstract class AbstractFlag extends AbstractNamedModelElement {
    /**
     * Provides the Metaschema model type of `FLAG`.
     * 
     * @returns the model type
     */
    getModelType(): ModelType {
        return ModelType.FLAG;
    }
}
