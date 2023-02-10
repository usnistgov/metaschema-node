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

import { defaultibleAttribute, processBooleanAttribute, processElement } from '@oscal/data-utils';
import {
    AbstractFlagDefinition,
    INamedModelDefinition,
    inlineNamedDefinitionMixin,
} from '@oscal/metaschema-model-common/definition';
import { AbstractFlagInstance } from '@oscal/metaschema-model-common/instance';
import { ModuleScope } from '@oscal/metaschema-model-common/util';
import { NAMED_VALUED_DEFINITION } from './processing/model.js';

class InternalFlagDefinition extends inlineNamedDefinitionMixin(AbstractFlagDefinition) {
    private readonly parent;
    private readonly parsed;

    getName() {
        return this.parsed.attributes.name;
    }

    getUseName() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}use-name'] ?? this.getName();
    }

    getFormalName() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}formal-name'];
    }

    getDescription() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}description'];
    }

    getRemarks() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks'];
    }

    getDatatypeAdapter() {
        return this.parsed.attributes['as-type'];
    }

    getAllowedValuesConstraints() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']
                ?.allowedValuesConstraints ?? []
        );
    }

    getMatchesConstraints() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']?.matchesConstraints ?? []
        );
    }

    getIndexHasKeyConstraints() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']?.indexHasConstraints ?? []
        );
    }

    getExpectConstraints() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']?.expectConstraints ?? []
        );
    }

    getConstraints() {
        return [
            ...this.getAllowedValuesConstraints(),
            ...this.getMatchesConstraints(),
            ...this.getIndexHasKeyConstraints(),
            ...this.getExpectConstraints(),
        ];
    }

    getModuleScope() {
        return ModuleScope.LOCAL;
    }

    getContainingMetaschema() {
        return this.parent.getContainingMetaschema();
    }

    getInlineInstance() {
        return this.parent;
    }

    constructor(flagDefinitionXml: Element, parent: XmlInlineFlagDefinition) {
        super();
        this.parent = parent;
        this.parsed = processElement(
            flagDefinitionXml,
            {
                name: NAMED_VALUED_DEFINITION.ATTRIBUTES.name,
                'as-type': NAMED_VALUED_DEFINITION.ATTRIBUTES['as-type'],
            },
            {
                ...NAMED_VALUED_DEFINITION.CHILDREN,
            },
        );
    }
}

export default class XmlInlineFlagDefinition extends AbstractFlagInstance {
    private readonly internalFlagDefinition;
    protected readonly xml;
    private readonly parsed;

    isRequired() {
        return this.parsed.attributes.required;
    }

    getDefinition() {
        return this.internalFlagDefinition;
    }
    getRemarks() {
        return this.internalFlagDefinition.getRemarks();
    }
    getName() {
        return this.internalFlagDefinition.getName();
    }
    getUseName() {
        return this.internalFlagDefinition.getUseName();
    }

    getXmlNamespace() {
        return undefined;
    }

    constructor(flagDefinitionXml: Element, parent: INamedModelDefinition) {
        super(parent);
        this.xml = flagDefinitionXml;
        this.internalFlagDefinition = new InternalFlagDefinition(flagDefinitionXml, this);
        this.parsed = processElement(
            flagDefinitionXml,
            {
                required: defaultibleAttribute(processBooleanAttribute, false),
            },
            {},
        );
    }
}
