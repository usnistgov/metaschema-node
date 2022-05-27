import MarkupLine from "../datatype/markup/MarkupLine";
import AbstractModelElement from "./AbstractModelElement";

/**
 * A marker interface for Metaschema constructs that can be members of a Metaschema definition's
 * model that are named.
 */
export default abstract class AbstractNamedModelElement extends AbstractModelElement {
    /**
     * Retrieve the name of the model element.
     * 
     * @returns the name
     */
    abstract getName(): string;

    /**
     * Retrieve the name to use for the model element, instead of the name.
     * 
     * @returns the use name or `undefined` if no use name is defined
     */
    abstract getUseName(): string | undefined;

    /**
     * The formal display name for a definition.
     * 
     * @returns the formal name
     */
    abstract getFormalName(): string | undefined;

    /**
     * Get the name to use based on the provided names. This method will return the use name provided by
     * {@link AbstractNamedModelElement.getUseName} if the call is not `null`, and fall back to the name provided by
     * {@link AbstractNamedModelElement.getName} otherwise. This is the model name to use for the for an instance where the
     * instance is referenced.
     * 
     * @returns the use name if available, or the name if not
     */
    getEffectiveName(): string {
        return this.getUseName() ?? this.getName();
    }

    /**
     * Get the name used for the associated property in JSON/YAML.
     * 
     * @returns the JSON property name
     */
    getJsonName(): string {
        return this.getEffectiveName();
    }

    /**
     * Get the text that describes the basic use of the definition
     * @returns a line of markup text
     */
    abstract getDescription(): MarkupLine | undefined;
}
