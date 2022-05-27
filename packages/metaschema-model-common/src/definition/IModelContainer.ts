import AbstractAssemblyInstance from "../instance/AbstractAssemblyInstance";
import AbstractChoiceInstance from "../instance/AbstractChoiceInstance";
import AbstractFieldInstance from "../instance/AbstractFieldInstance";
import IModelInstance from "../instance/IModelInstance";
import INamedModelInstance from "../instance/INamedModelInstance";
import { AbstractConstructor } from "../util/mixin";

/**
 * Indicates that the Metaschema definition type has a complex model that can contain flags, field,
 * and assembly instances.
 */
export default interface IModelContainer {
    /**
     * Get the model instance contained within the model with the associated use name
     * (see {@link AbstractNamedModelInstance.getUseName})
     * 
     * @param name the use name of the model instance
     * @returns the matching model instance, or `undefined` if no match was found
     */
    getModelInstanceByName(name: string): INamedModelInstance | undefined;

    /**
     * Get all named model instances within the container.
     * 
     * @returns an ordered mapping of use name to model instance
     */
    getNamedModelInstances(): Map<string, INamedModelInstance>;

    /**
     * Get the field instance contained within the model with the associated use name.
     * (see {@link AbstractFieldInstance.getUseName})
     * 
     * @param name the use name of the field instance
     * @returns the matching field instance, or `null` if no match was found
     */
    getFieldInstanceByName(name: string): AbstractFieldInstance | undefined;

    /**
     * Get all field instances within the container.
     * 
     * @returns a mapping of use name to field instance
     */
    getFieldInstances(): Map<string, AbstractFieldInstance>;

    /**
     * Get the assembly instance contained within the model with the associated use name.
     * (see {@link AbstractAssemblyInstance.getUseName})
     * 
     * @param name the use name of the assembly instance
     * @returns the matching assembly instance, or `undefined` if no match was found
     */
    getAssemblyInstanceByName(name: string): AbstractAssemblyInstance | undefined;

    /**
     * Get all assembly instances within the container.
     * 
     * @returns a mapping of use name to assembly instance
     */
    getAssemblyInstances(): Map<string, AbstractAssemblyInstance>;

    /**
     * Get all choice instances within the container.
     * 
     * @returns a list of choice instances
     */
    getChoiceInstances(): AbstractChoiceInstance;

    /**
     * Get all model instances within the container.
     * 
     * @returns an ordered collection of model instances
     */
    getModelInstances(): IModelInstance;
}

export function modelContainable<TBase extends AbstractConstructor<{}>>(Base: TBase) {
    abstract class ModelContainer extends Base implements IModelContainer {
        abstract getModelInstanceByName(name: string): INamedModelInstance | undefined;
        abstract getNamedModelInstances(): Map<string, INamedModelInstance>;
        abstract getFieldInstanceByName(name: string): AbstractFieldInstance | undefined;
        abstract getFieldInstances(): Map<string, AbstractFieldInstance>;
        abstract getAssemblyInstanceByName(name: string): AbstractAssemblyInstance | undefined;
        abstract getAssemblyInstances(): Map<string, AbstractAssemblyInstance>;
        abstract getChoiceInstances(): AbstractChoiceInstance;
        abstract getModelInstances(): IModelInstance;
    }
    return ModelContainer;
}