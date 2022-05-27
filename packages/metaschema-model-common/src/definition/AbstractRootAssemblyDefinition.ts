import QName from "../util/QName";
import AbstractAssemblyDefinition from "./AbstractAssemblyDefinition";

export default abstract class AbstractRootAssemblyDefinition extends AbstractAssemblyDefinition {
    /**
     * Get the root name.
     * 
     * @returns the root name
     */
    abstract getRootName(): string;

    /**
     * Get the XML qualified name to use in XML as the root element.
     * 
     * @returns the root XML qualified name
     */
    getRootXmlQName(): QName {
        return new QName(this.getRootName(), this.getContainingMetaschema().getXmlNamespace());
    }

    /**
     * Get the name used for the associated property in JSON/YAML.
     * 
     * @returns the root JSON property name
     */
    getRootJsonName() {
        return this.getRootName()
    }
}