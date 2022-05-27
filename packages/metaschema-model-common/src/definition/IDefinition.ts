import AbstractConstraint from "../constraint/AbstractConstraint";
import { AbstractModelElement, AbstractNamedModelElement } from "../element";
import { AbstractConstructor } from "../util/mixin";
import { ModuleScope } from "../util/types";

export default interface IDefinition extends AbstractModelElement {
    /**
     * Retrieve the list of constraints associated with this definition.
     * TODO implement constraints
     * @returns the list of constraints
     */
    getConstraints(): AbstractConstraint[];
    /**
     * Retrieve the definition's scope within the context of its defining module.
     * 
     * @returns the module scope
     */
    getModuleScope(): ModuleScope;
}

export function defineable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class Definition extends Base implements IDefinition {
        abstract getConstraints(): AbstractConstraint[];
        abstract getModuleScope(): ModuleScope;
    }
    return Definition;
}
