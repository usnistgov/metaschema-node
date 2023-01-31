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

import { optionalOneChild, processBooleanAttribute, processElement } from '@oscal/data-utils';
import { AbstractMetaschema } from '@oscal/metaschema-model-common';
import { AbstractFieldDefinition } from '@oscal/metaschema-model-common/definition';
import { AbstractFlagInstance } from '@oscal/metaschema-model-common/instance';
import { NAMED_MODEL_DEFINITION, NAMED_VALUED_DEFINITION } from './processing/model.js';
import XmlFlagContainerSupport from './XmlFlagContainerSupport.js';

export default class XmlGlobalFieldDefinition extends AbstractFieldDefinition {
    private readonly metaschema;
    protected readonly xml;
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

    isCollapsible() {
        return this.parsed.attributes.collapsible;
    }

    getInlineInstance() {
        return undefined;
    }

    getModuleScope() {
        return this.parsed.attributes.scope;
    }

    getContainingMetaschema() {
        return this.metaschema;
    }

    getDatatypeAdapter() {
        return this.parsed.attributes['as-type'];
    }

    private flagContainerSupport: XmlFlagContainerSupport | undefined;
    getFlagInstances(): Map<string, AbstractFlagInstance> {
        if (this.flagContainerSupport === undefined) {
            this.flagContainerSupport = new XmlFlagContainerSupport(this.xml, this);
        }
        return this.flagContainerSupport.flagInstances;
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

    getIndexConstraints() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']?.indexConstraints ?? [];
    }

    getUniqueConstraints() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']?.uniqueConstraints ?? []
        );
    }

    getCardinalityConstraints() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint']?.cardinalityConstraints ??
            []
        );
    }

    getConstraints() {
        return [
            ...this.getAllowedValuesConstraints(),
            ...this.getMatchesConstraints(),
            ...this.getIndexHasKeyConstraints(),
            ...this.getExpectConstraints(),
            ...this.getIndexConstraints(),
            ...this.getUniqueConstraints(),
            ...this.getCardinalityConstraints(),
        ];
    }

    hasJsonKey() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-key'] !== undefined;
    }

    getJsonKeyFlagInstance() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-key']
            ? this.getFlagInstances().get(
                  this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-key'],
              )
            : undefined;
    }

    getJsonValueKeyName() {
        return (
            this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-value-key'] ??
            this.getDatatypeAdapter().defaultJsonValueKey
        );
    }

    getJsonValueKeyFlagInstance() {
        return this.getFlagInstances().get(this.getJsonValueKeyName());
    }

    constructor(fieldDefinitionXml: Element, metaschema: AbstractMetaschema) {
        super();
        this.metaschema = metaschema;
        this.xml = fieldDefinitionXml;

        this.parsed = processElement(
            fieldDefinitionXml,
            {
                ...NAMED_VALUED_DEFINITION.ATTRIBUTES,
                ...NAMED_MODEL_DEFINITION.ATTRIBUTES,
                collapsible: (attr, ctx) => (attr !== null ? processBooleanAttribute(attr, ctx) : true),
            },
            {
                ...NAMED_VALUED_DEFINITION.CHILDREN,
                ...NAMED_MODEL_DEFINITION.CHILDREN,
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-value-key': optionalOneChild(
                    (child) => processElement(child, {}, {}).body,
                ),
            },
        );
    }
}
