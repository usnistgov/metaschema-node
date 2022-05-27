import { AbstractNamedModelElement } from "../element";
import { AbstractConstructor } from "../util/mixin";
import IDefinition, { defineable } from "./IDefinition";

/**
 * This marker interface identifies Metaschema definition types that have associated values (i.e.,
 * field, flag).
 */
export default interface IValuedDefinition extends IDefinition {

}

export function valuedDefineable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class ValuedDefinition extends defineable(Base) implements IValuedDefinition {

    }
    return ValuedDefinition;
}