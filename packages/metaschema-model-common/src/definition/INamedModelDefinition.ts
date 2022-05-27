import { AbstractNamedModelElement } from '../element';
import AbstractFlagInstance from '../instance/AbstractFlagInstance';
import { AbstractConstructor } from '../util/mixin';
import INamedDefinition, { namedDefineable } from './INamedDefinition';

/**
 * This marker interface identifies a definition that is intended to be part of an Assembly's model.
 *
 * These definitions contain flags, and potentially a simple value (for a field) or complex model
 * contents (for an assembly).
 */
export default interface INamedModelDefinition extends INamedDefinition {
    /**
     * Identifies if the field has flags or not.
     *
     * @returns `true` if the field has not flags, or false otherwise
     */
    isSimple(): boolean;
    /**
     * Retrieves the flag instances for all flags defined on the containing definition.
     *
     * @return the flags
     */
    getFlagInstances(): Map<string, AbstractFlagInstance>;
    /**
     * Indicates if a flag's value can be used as a property name in the containing object in JSON who's
     * value will be the object containing the flag. In such cases, the flag will not appear in the
     * object. This is only allowed if the flag is required, as determined by a `true` result from
     * {@link AbstractFlagInstance.isRequired}. The {@link AbstractFlagInstance} can be retrieved using
     * {@link getJsonKeyFlagInstance}.
     *
     * @return `true` if the flag's value can be used as a property name, or `false` otherwise
     */
    hasJsonKey(): boolean;
    getJsonKeyFlagInstance(): AbstractFlagInstance | undefined;
}

export function namedModelDefineable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedModelDefinition extends namedDefineable(Base) implements INamedModelDefinition {
        abstract getFlagInstances(): Map<string, AbstractFlagInstance>;

        isSimple(): boolean {
            return this.getFlagInstances().size === 0;
        }

        abstract hasJsonKey(): boolean;
        abstract getJsonKeyFlagInstance(): AbstractFlagInstance | undefined;
    }
    return NamedModelDefinition;
}
