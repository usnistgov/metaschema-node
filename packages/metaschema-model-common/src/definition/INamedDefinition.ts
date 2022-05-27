import { AbstractNamedModelElement } from '../element';
import INamedInstance from '../instance/INamedInstance';
import { AbstractConstructor } from '../util/mixin';
import IDefinition, { defineable } from './IDefinition';

/**
 * This marker interface is used for some collections that contain various named definitions.
 */
export default interface INamedDefinition extends IDefinition {
    /**
     * Determine if the definition is defined inline, meaning the definition is declared where it is
     * used.
     *
     * @returns `true` if the definition is declared inline or `false` if the definition is able to be globally referenced
     */
    isInline(): boolean;

    /**
     * If the definition is defined inline, return the instance the definition is inlined for.
     * @returns the instance or `undefined`
     */
    getInlineInstance(): INamedInstance | undefined;
}

export function namedDefineable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedDefinition extends defineable(Base) implements INamedDefinition {
        abstract isInline(): boolean;
        abstract getInlineInstance(): INamedInstance | undefined;
    }
    return NamedDefinition;
}
