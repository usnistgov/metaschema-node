/*
 * Portions of this software was developed by employees of the National Institute
 * of Standards and Technology (NIST), an agency of the Federal Government and is
 * being made available as a public service. Pursuant to title 17 United States
 * Code Section 105, works of NIST employees are not subject to copyright
 * protection in the United States. This software may be subject to foreign
 * copyright. Permission in the United States and in foreign countries, to the
 * extent that NIST may hold copyright, to use, copy, modify, create derivative
 * works, and distribute this software and its documentation without fee is hereby
 * granted on a non-exclusive basis, provided that this notice and disclaimer
 * of warranty appears in all copies.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS' WITHOUT ANY WARRANTY OF ANY KIND, EITHER
 * EXPRESSED, IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, ANY WARRANTY
 * THAT THE SOFTWARE WILL CONFORM TO SPECIFICATIONS, ANY IMPLIED WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND FREEDOM FROM
 * INFRINGEMENT, AND ANY WARRANTY THAT THE DOCUMENTATION WILL CONFORM TO THE
 * SOFTWARE, OR ANY WARRANTY THAT THE SOFTWARE WILL BE ERROR FREE.  IN NO EVENT
 * SHALL NIST BE LIABLE FOR ANY DAMAGES, INCLUDING, BUT NOT LIMITED TO, DIRECT,
 * INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES, ARISING OUT OF, RESULTING FROM,
 * OR IN ANY WAY CONNECTED WITH THIS SOFTWARE, WHETHER OR NOT BASED UPON WARRANTY,
 * CONTRACT, TORT, OR OTHERWISE, WHETHER OR NOT INJURY WAS SUSTAINED BY PERSONS OR
 * PROPERTY OR OTHERWISE, AND WHETHER OR NOT LOSS WAS SUSTAINED FROM, OR AROSE OUT
 * OF THE RESULTS OF, OR USE OF, THE SOFTWARE OR SERVICES PROVIDED HEREUNDER.
 */
import AbstractModelElement from '../element/AbstractModelElement.js';
import { AbstractConstructor } from '../util/mixin.js';
import QName from '../util/QName.js';
import { JsonGroupAsBehavior, XmlGroupAsBehavior } from '../util/types.js';
import IInstance, { instanceable } from './IInstance.js';

/**
 * This marker interface is used to identify a field or assembly instance that is a member of an
 * assembly's model.
 */
export default interface IModelInstance extends IInstance {
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
    abstract class ModelInstance extends instanceable(Base) implements IModelInstance {
        abstract getMinOccurs(): number;
        abstract getMaxOccurs(): number;
        abstract getGroupAsName(): string | undefined;
        abstract getGroupAsXmlNamespace(): string | undefined;
        abstract getJsonGroupAsBehavior(): JsonGroupAsBehavior;
        abstract getXmlGroupAsBehavior(): XmlGroupAsBehavior;
        getXmlGroupAsQName(): QName | undefined {
            const groupAsName = this.getGroupAsName();
            return this.getXmlGroupAsBehavior() === XmlGroupAsBehavior.GROUPED && groupAsName
                ? new QName(groupAsName, this.getGroupAsXmlNamespace())
                : undefined;
        }
    }
    return ModelInstance;
}
