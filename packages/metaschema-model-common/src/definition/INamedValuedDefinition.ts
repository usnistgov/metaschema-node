import { AbstractNamedModelElement } from '../element';
import { AbstractConstructor } from '../util/mixin';
import INamedDefinition, { namedDefineable } from './INamedDefinition';
import IValuedDefinition, { valuedDefineable } from './IValuedDefinition';

/**
 * This marker interface is used for some collections that contain various named definitions that
 * have an associated value.
 */
export default interface INamedValuedDefinition extends IValuedDefinition, INamedDefinition {}

export function namedValuedDefineable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedValuedDefinition
        extends namedDefineable(valuedDefineable(Base))
        implements INamedValuedDefinition {}
    return NamedValuedDefinition;
}
