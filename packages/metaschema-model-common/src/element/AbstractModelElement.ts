import MarkupMultiLine from "../datatype/markup/MarkupMultiLine";
import AbstractMetaschema from "../AbstractMetaschema";
import { ModelType } from "../util/types";

/**
 * A marker interface for Metaschema constructs that can be members of a Metaschema definition's
 * model.
 */
export default abstract class AbstractModelElement {
    /**
     * Get the Metaschema model type of the information element.
     */
    abstract getModelType(): ModelType;

    /**
     * Retrieve the remarks associated with this information element, if any.
     * 
     * @returnsthe remarks or `undefined` if no remarks are defined
     */
    abstract getRemarks(): MarkupMultiLine | undefined;

    /**
     * Retrieves the Metaschema instance that contains for the information element's declaration.
     */
    abstract getContainingMetaschema(): AbstractMetaschema;
}