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

import { processElement, requireAttribute } from '@oscal/data-utils';
import { AbstractAssemblyDefinition } from '@oscal/metaschema-model-common/definition';
import { AbstractAssemblyInstance } from '@oscal/metaschema-model-common/instance';
import { JsonGroupAsBehavior } from '@oscal/metaschema-model-common/util';
import { MODEL_INSTANCE, NAMED_MODEL_ELEMENT } from './processing/model.js';

export default class XmlAssemblyInstance extends AbstractAssemblyInstance {
    private readonly parsed;

    getName(): string {
        return this.parsed.attributes.ref;
    }

    getRemarks() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks'];
    }

    getUseName() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}use-name'];
    }

    getDefinition() {
        const definition = this.getContainingDefinition()
            .getContainingMetaschema()
            .getScopedAssemblyDefinitionByName(this.getName());
        if (definition) {
            return definition;
        }
        throw new Error('Definition not found');
    }

    getMinOccurs() {
        return this.parsed.attributes['min-occurs'];
    }

    getMaxOccurs() {
        return this.parsed.attributes['max-occurs'];
    }

    getGroupAsName() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}group-as']?.attributes.name ?? undefined
        );
    }

    getJsonGroupAsBehavior() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}group-as']?.attributes['in-json'] ??
            JsonGroupAsBehavior.SINGLETON_OR_LIST
        );
    }

    getXmlGroupAsBehavior() {
        return this.parsed.attributes['in-xml'];
    }

    constructor(xml: Element, parent: AbstractAssemblyDefinition) {
        super(parent);
        this.parsed = processElement(
            xml,
            {
                ref: requireAttribute((attr) => attr),
                ...MODEL_INSTANCE.ATTRIBUTES,
            },
            {
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks':
                    NAMED_MODEL_ELEMENT.CHILDREN['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks'],
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}use-name':
                    NAMED_MODEL_ELEMENT.CHILDREN['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}use-name'],
                ...MODEL_INSTANCE.CHILDREN,
            },
        );
    }
}
