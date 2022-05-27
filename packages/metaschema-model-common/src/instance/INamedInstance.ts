import INamedModelDefinition from "../definition/INamedModelDefinition";
import { AbstractNamedModelElement } from "../element";
import MarkupLine from "../datatype/markup/MarkupLine";
import { AbstractConstructor } from "../util/mixin";
import QName from "../util/QName";
import IInstance, { instanceable } from "./IInstance";

/**
 * This marker interface indicates that the instance has a flag, field, or assembly name associated
 * with it which will be used in JSON/YAML or XML to identify the data.
 */
export default interface INamedInstance extends IInstance, AbstractNamedModelElement {
    /**
     * Retrieve the definition of this instance.
     * 
     * @returns the corresponding definition
     */
    getDefinition(): INamedModelDefinition;
    /**
     * Get the XML qualified name to use in XML.
     * 
     * @returns the XML qualified name, or `undefined` if there isn't one
     */
    getXmlQName(): QName | undefined; //stub
    /**
     * Retrieve the XML namespace for this instance.
     * 
     * @returns the XML namespace or `undefined` if no namespace is defined
     */
    getXmlNamespace(): string | undefined;
}

export function namedInstanceable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedInstance extends instanceable(Base) implements INamedInstance {
        abstract getDefinition(): INamedModelDefinition;
        getXmlQName(): QName | undefined {
            return new QName(this.getEffectiveName(), this.getXmlNamespace());
        }
        getXmlNamespace(): string | undefined {
            return this.getContainingMetaschema().getXmlNamespace();
        }
        abstract getContainingDefinition(): INamedModelDefinition;
        getFormalName(): string | undefined {
            return undefined;
        }
        getDescription(): MarkupLine | undefined {
            return undefined;
        }
    }
    return NamedInstance;
}