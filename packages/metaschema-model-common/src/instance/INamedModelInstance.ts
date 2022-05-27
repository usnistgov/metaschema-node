import AbstractAssemblyDefinition from "../definition/AbstractAssemblyDefinition";
import { AbstractNamedModelElement } from "../element";
import { AbstractConstructor } from "../util/mixin";
import AbstractFlagInstance from "./AbstractFlagInstance";
import IModelInstance, { modelInstanceable } from "./IModelInstance";
import INamedInstance, { namedInstanceable } from "./INamedInstance";

export default interface INamedModelInstance extends INamedInstance, IModelInstance {
    /**
     * Propagate override from {@link IModelInstance}
     */
    getContainingDefinition(): AbstractAssemblyDefinition;

    /**
     * Indicates if a flag's value can be used as a property name in the containing object in JSON who's
     * value will be the object containing the flag. In such cases, the flag will not appear in the
     * object. This is only allowed if the flag is required, as determined by a `true` result from
     * {@link AbstractFlagInstance.isRequired}. The {@link AbstractFlagInstance} can be retrieved using
     * {@link getJsonKeyFlagInstance}.
     * 
     * @returns {@code true} if the flag's value can be used as a property name, or `false` otherwise
     */
    hasJsonKey(): boolean;

    /**
     * Retrieves the flag instance to use as as the property name for the containing object in JSON
     * who's value will be the object containing the flag. (see {@link hasJsonKey})
     * 
     * @returns the flag instance if a JSON key is configured, or `undefined` otherwise
     */
    getJsonKeyFlagInstance(): AbstractFlagInstance | undefined;
}

export function namedModelInstanceable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedModelInstance extends namedInstanceable(modelInstanceable(Base)) implements INamedModelInstance {
        hasJsonKey(): boolean {
            return this.getDefinition().hasJsonKey();
        }
        getJsonKeyFlagInstance(): AbstractFlagInstance | undefined {
            return this.getDefinition().getJsonKeyFlagInstance();
        }
    }
    return NamedModelInstance;
}
