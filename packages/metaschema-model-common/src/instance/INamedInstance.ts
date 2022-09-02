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
import MarkupLine from '../datatype/markup/MarkupLine.js';
import { AbstractConstructor } from '../util/mixin.js';
import QName from '../util/QName.js';
import IInstance, { instanceMixin } from './IInstance.js';
import AbstractNamedModelElement from '../element/AbstractNamedModelElement.js';
import INamedDefinition from '../definition/INamedDefinition.js';

/**
 * This marker interface indicates that the instance has a flag, field, or assembly name associated
 * with it which will be used in JSON/YAML or XML to identify the data.
 */
export default interface INamedInstance extends IInstance, AbstractNamedModelElement {
    /**
     * Retrieve the definition of this instance.
     *
     * @returns the corresponding definition
     */
    getDefinition(): INamedDefinition;
    /**
     * Get the XML qualified name to use in XML.
     *
     * @returns the XML qualified name, or `undefined` if there isn't one
     */
    getXmlQName(): QName | undefined; //stub
    /**
     * Retrieve the XML namespace for this instance.
     *
     * @returns the XML namespace or `undefined` if no namespace is defined
     */
    getXmlNamespace(): string | undefined;
}

export function namedInstanceMixin<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class NamedInstance extends instanceMixin(Base) implements INamedInstance {
        abstract getDefinition(): INamedDefinition;
        getXmlQName(): QName | undefined {
            return new QName(this.getEffectiveName(), this.getXmlNamespace());
        }
        getXmlNamespace(): string | undefined {
            return this.getContainingMetaschema().xmlNamespace;
        }
        getFormalName(): string | undefined {
            return undefined;
        }
        getDescription(): MarkupLine | undefined {
            return undefined;
        }
    }
    return NamedInstance;
}
