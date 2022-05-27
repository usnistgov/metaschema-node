import AbstractMetaschema from '../AbstractMetaschema';
import AbstractAssemblyDefinition from '../definition/AbstractAssemblyDefinition';
import AbstractRootAssemblyDefinition from '../definition/AbstractRootAssemblyDefinition';
import MarkupMultiLine from '../datatype/markup/markupMultiLine';
import QName from '../util/QName';
import { JsonGroupAsBehavior, XmlGroupAsBehavior } from '../util/types';
import AbstractAssemblyInstance from './AbstractAssemblyInstance';

export default class RootAssemblyDefinitionInstance extends AbstractAssemblyInstance {
    private readonly rootAssemblyDefinition: AbstractRootAssemblyDefinition;

    public constructor(rootAssemblyDefinition: AbstractRootAssemblyDefinition) {
        super();
        this.rootAssemblyDefinition = rootAssemblyDefinition;
    }

    /**
     * Get the underlying definition used for this root-level instance.
     *
     * @returns the proxied definition
     */
    protected getProxy(): AbstractRootAssemblyDefinition {
        return this.rootAssemblyDefinition;
    }

    getName(): string {
        return this.rootAssemblyDefinition.getRootName();
    }

    getUseName(): string | undefined {
        return undefined;
    }

    getXmlNamespace(): string | undefined {
        return this.getXmlQName().namespace;
    }

    getXmlQName(): QName {
        return this.rootAssemblyDefinition.getRootXmlQName();
    }

    getRemarks(): MarkupMultiLine | undefined {
        return this.rootAssemblyDefinition.getRemarks();
    }

    getContainingDefinition(): AbstractAssemblyDefinition {
        // TODO: either make this field nullable or change the design
        return this.rootAssemblyDefinition;
    }

    getMinOccurs(): number {
        return 1;
    }

    getMaxOccurs(): number {
        return 1;
    }

    getGroupAsName(): string | undefined {
        return undefined;
    }

    getGroupAsXmlNamespace(): string | undefined {
        return undefined;
    }

    getJsonGroupAsBehavior(): JsonGroupAsBehavior {
        return JsonGroupAsBehavior.NONE;
    }

    getXmlGroupAsBehavior(): XmlGroupAsBehavior {
        return XmlGroupAsBehavior.UNGROUPED;
    }

    getDefinition(): AbstractAssemblyDefinition {
        return this.getProxy();
    }

    getContainingMetaschema(): AbstractMetaschema {
        return this.rootAssemblyDefinition.getContainingMetaschema();
    }
}
