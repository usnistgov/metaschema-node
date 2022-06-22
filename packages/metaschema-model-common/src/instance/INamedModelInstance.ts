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
import AbstractAssemblyDefinition from '../definition/AbstractAssemblyDefinition.js';
import AbstractNamedModelElement from '../element/AbstractNamedModelElement.js';
import { AbstractConstructor } from '../util/mixin.js';
import AbstractFlagInstance from './AbstractFlagInstance.js';
import IModelInstance, { modelInstanceable } from './IModelInstance.js';
import INamedInstance, { namedInstanceable } from './INamedInstance.js';

export default interface INamedModelInstance extends INamedInstance, IModelInstance {
    /**
     * Propagate override from {@link IModelInstance}
     */
    getContainingDefinition(): AbstractAssemblyDefinition;

    /**
     * Indicates if a flag's value can be used as a property name in the containing object in JSON who's
     * value will be the object containing the flag. In such cases, the flag will not appear in the
     * object. This is only allowed if the flag is required, as determined by a `true` result from
     * {@link AbstractFlagInstance.isRequired}. The {@link AbstractFlagInstance} can be retrieved using
     * {@link getJsonKeyFlagInstance}.
     *
     * @returns {@code true} if the flag's value can be used as a property name, or `false` otherwise
     */
    hasJsonKey(): boolean;

    /**
     * Retrieves the flag instance to use as as the property name for the containing object in JSON
     * who's value will be the object containing the flag. (see {@link hasJsonKey})
     *
     * @returns the flag instance if a JSON key is configured, or `undefined` otherwise
     */
    getJsonKeyFlagInstance(): AbstractFlagInstance | undefined;
}

export function namedModelInstanceable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedModelInstance
        extends namedInstanceable(modelInstanceable(Base))
        implements INamedModelInstance
    {
        abstract getContainingDefinition(): AbstractAssemblyDefinition;

        hasJsonKey(): boolean {
            return this.getDefinition().hasJsonKey();
        }
        getJsonKeyFlagInstance(): AbstractFlagInstance | undefined {
            return this.getDefinition().getJsonKeyFlagInstance();
        }
    }
    return NamedModelInstance;
}
