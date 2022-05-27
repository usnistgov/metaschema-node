import AbstractMetaschema from '../AbstractMetaschema';
import INamedModelDefinition from '../definition/INamedModelDefinition';
import AbstractModelElement from '../element/AbstractModelElement';
import { AbstractConstructor } from '../util/mixin';

export default interface IInstance extends AbstractModelElement {
    /**
     * Retrieve the Metaschema definition on which the instance was declared. This value will typically
     * not be `undefined`, except in the case that the instance represents a definition at the root.
     *
     * @returns the Metaschema definition on which the instance was declared
     */
    getContainingDefinition(): INamedModelDefinition;
}

export function instanceable<TBase extends AbstractConstructor<AbstractModelElement>>(Base: TBase) {
    abstract class Instance extends Base implements IInstance {
        abstract getContainingDefinition(): INamedModelDefinition;
        getContainingMetaschema(): AbstractMetaschema {
            return this.getContainingDefinition().getContainingMetaschema();
        }
    }
    return Instance;
}
