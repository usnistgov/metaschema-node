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
import AbstractNamedModelElement from '../element/AbstractNamedModelElement.js';
import INamedInstance from '../instance/INamedInstance.js';
import { AbstractConstructor } from '../util/mixin.js';
import IDefinition, { definitionMixin } from './IDefinition.js';

/**
 * This marker interface is used for some collections that contain various named definitions.
 */
export default interface INamedDefinition extends IDefinition, AbstractNamedModelElement {
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

export function namedDefinitionMixin<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedDefinition extends definitionMixin(Base) implements INamedDefinition {
        isInline(): boolean {
            return this.getInlineInstance() !== undefined;
        }
        abstract getInlineInstance(): INamedInstance | undefined;
    }
    return NamedDefinition;
}
