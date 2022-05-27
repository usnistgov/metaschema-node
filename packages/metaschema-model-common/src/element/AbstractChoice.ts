import AbstractModelElement from "./AbstractModelElement";
import { ModelType } from "../util/types";

/**
 * A marker interface for an information element that is an assembly model type.
 */
export default abstract class AbstractChoice extends AbstractModelElement {
    /**
     * Provides the Metaschema model type of `CHOICE`.
     * 
     * @returns the model type
     */
    getModelType(): ModelType {
        return ModelType.CHOICE;
    }
}
