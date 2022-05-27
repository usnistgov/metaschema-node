import AbstractFieldDefinition from "../definition/AbstractFieldDefinition";
import AbstractField from "../element/AbstractField";
import QName from "../util/QName";
import { namedModelInstanceable } from "./INamedModelInstance";

export default abstract class AbstractFieldInstance extends namedModelInstanceable(AbstractField) {
    getXmlNamespace(): string | undefined {
        return this.isInXmlWrapped() ? super.getXmlNamespace() : undefined;
    }

    getXmlQName(): QName | undefined {
        return this.isInXmlWrapped() ? super.getXmlQName() : undefined;
    }

    getJsonName(): string {
        if (this.getMaxOccurs() == -1 || this.getMaxOccurs() > 1) {
            return this.getGroupAsName() ?? "null group-as name";
        }
        return this.getEffectiveName();
    }

    getGroupAsXmlNamespace(): string | undefined {
        return this.isInXmlWrapped() ? this.getContainingMetaschema().getXmlNamespace() : undefined;
    }

    abstract getDefinition(): AbstractFieldDefinition;

    /**
     * Determines if the field is configured to have a wrapper in XML.
     * 
     * @return `true` if an XML wrapper is required, or `false` otherwise
     */
    abstract isInXmlWrapped(): boolean;

    /**
     * Determines if the instance is a simple field value without flags, or if it has a complex
     * structure (i.e, flags, model).
     * 
     * @return `true` if the instance contains only a value, or `false` otherwise
     */
    isSimple(): boolean {
        return this.getDefinition().isSimple();
    }
}