import AbstractAssemblyDefinition from '../definition/AbstractAssemblyDefinition';
import { AbstractModelElement } from '../element';
import { AbstractConstructor } from '../util/mixin';
import QName from '../util/QName';
import { JsonGroupAsBehavior, XmlGroupAsBehavior } from '../util/types';
import IInstance from './IInstance';

/**
 * This marker interface is used to identify a field or assembly instance that is a member of an
 * assembly's model.
 */
export default interface IModelInstance extends IInstance {
    /**
     * Retrieve the Metaschema assembly definition on which the info element was declared.
     *
     * @returns the Metaschema assembly definition on which the info element was declared
     */
    getContainingDefinition(): AbstractAssemblyDefinition;

    /**
     * Get the name used for the associated element wrapping a collection of elements in XML. This value
     * is required when {@link getXmlGroupAsBehavior} = {@link XmlGroupAsBehavior.GROUPED}. This name
     * will be the element name wrapping a collection of elements.
     *
     * @returns the groupAs QName or `undefined` if no name is configured, such as when {@link getMaxOccurs} = `1`.
     */
    getXmlGroupAsQName(): QName | undefined;

    /**
     * Get the minimum cardinality for this associated instance. This value must be less than or equal
     * to the maximum cardinality returned by {@link getMaxOccurs}.
     *
     * @returns `0` or a positive integer value
     */
    getMinOccurs(): number;

    /**
     * Get the maximum cardinality for this associated instance. This value must be greater than or
     * equal to the minimum cardinality returned by {@link getMinOccurs}, or `-1` if unbounded.
     *
     * @returns a positive integer value or `-1` if unbounded
     */
    getMaxOccurs(): number;

    /**
     * Get the name provided for grouping. An instance in Metaschema must have a group name if the
     * instance has a cardinality greater than `1`.
     *
     * @returns the group-as name or `undefined` if no name is configured, such as when {@link getMaxOccurs} = 1
     */
    getGroupAsName(): string | undefined;

    /**
     * Retrieve the XML namespace for this group.
     *
     * @returns the XML namespace or `undefined` if no namespace is used
     */
    getGroupAsXmlNamespace(): string | undefined;

    /**
     * Gets the configured JSON group-as strategy. A JSON group-as strategy is only required when
     * {@link getMaxOccurs} &gt; 1.
     *
     * @returns the JSON group-as strategy, or {@code JsonGroupAsBehavior#NONE} if {@link getMaxOccurs} = 1
     */
    getJsonGroupAsBehavior(): JsonGroupAsBehavior;

    /**
     * Gets the configured XML group-as strategy. A XML group-as strategy is only required when
     * {@link getMaxOccurs} &gt; 1.
     *
     * @returns the JSON group-as strategy, or {@code XmlGroupAsBehavior#UNGROUPED} if {@link getMaxOccurs} = 1
     */
    getXmlGroupAsBehavior(): XmlGroupAsBehavior;
}

export function modelInstanceable<TBase extends AbstractConstructor<AbstractModelElement>>(Base: TBase) {
    abstract class ModelInstance extends Base implements IModelInstance {
        abstract getMinOccurs(): number;
        abstract getMaxOccurs(): number;
        abstract getGroupAsName(): string | undefined;
        abstract getGroupAsXmlNamespace(): string | undefined;
        abstract getJsonGroupAsBehavior(): JsonGroupAsBehavior;
        abstract getXmlGroupAsBehavior(): XmlGroupAsBehavior;
        abstract getContainingDefinition(): AbstractAssemblyDefinition;
        getXmlGroupAsQName(): QName | undefined {
            const groupAsName = this.getGroupAsName();
            return this.getXmlGroupAsBehavior() === XmlGroupAsBehavior.GROUPED && groupAsName
                ? new QName(groupAsName, this.getGroupAsXmlNamespace())
                : undefined;
        }
    }
    return ModelInstance;
}
