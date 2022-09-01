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
import AbstractAssemblyInstance from '../instance/AbstractAssemblyInstance.js';
import AbstractChoiceInstance from '../instance/AbstractChoiceInstance.js';
import AbstractFieldInstance from '../instance/AbstractFieldInstance.js';
import IModelInstance from '../instance/IModelInstance.js';
import INamedModelInstance from '../instance/INamedModelInstance.js';
import { AbstractConstructor } from '../util/mixin.js';

/**
 * Indicates that the Metaschema definition type has a complex model that can contain flags, field,
 * and assembly instances.
 */
export default interface IModelContainer {
    /**
     * Get all named model instances within the container.
     *
     * @returns an ordered mapping of use name to model instance
     */
    getNamedModelInstances(): Map<string, INamedModelInstance>;

    /**
     * Get all field instances within the container.
     *
     * @returns a mapping of use name to field instance
     */
    getFieldInstances(): Map<string, AbstractFieldInstance>;

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
    getChoiceInstances(): AbstractChoiceInstance[];

    /**
     * Get all model instances within the container.
     *
     * @returns an ordered collection of model instances
     */
    getModelInstances(): IModelInstance[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function modelContainerMixin<TBase extends AbstractConstructor<any>>(Base: TBase) {
    abstract class ModelContainer extends Base implements IModelContainer {
        abstract getNamedModelInstances(): Map<string, INamedModelInstance>;
        abstract getFieldInstances(): Map<string, AbstractFieldInstance>;
        abstract getAssemblyInstances(): Map<string, AbstractAssemblyInstance>;
        abstract getChoiceInstances(): AbstractChoiceInstance[];
        abstract getModelInstances(): IModelInstance[];
    }
    return ModelContainer;
}
