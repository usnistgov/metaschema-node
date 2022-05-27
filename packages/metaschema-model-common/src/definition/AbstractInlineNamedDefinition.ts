import { AbstractNamedModelElement } from '../element';
import INamedInstance from '../instance/INamedInstance';
import { namedDefineable } from './INamedDefinition';

/**
 * A trait indicating that the implementation is a localized definition that is declared in-line as
 * an instance.
 *
 * @param <Instance> the associated instance type
 */
export default abstract class AbstractInlineNamedDefinition<Instance extends INamedInstance> extends namedDefineable(
    AbstractNamedModelElement,
) {
    isInline(): boolean {
        return true;
    }

    abstract getInlineInstance(): Instance;
}
