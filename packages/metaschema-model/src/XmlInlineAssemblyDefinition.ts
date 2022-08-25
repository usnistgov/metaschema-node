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

import { processElement } from '@oscal/data-utils';
import { AbstractAssemblyDefinition, inlineNamedDefineable } from '@oscal/metaschema-model-common/definition';
import { AbstractAssemblyInstance } from '@oscal/metaschema-model-common/instance';
import { JsonGroupAsBehavior, ModuleScope } from '@oscal/metaschema-model-common/util';
import { MODEL_INSTANCE, NAMED_DEFINITION, NAMED_MODEL_DEFINITION } from './processing/model.js';
import XmlInlineFlagDefinition from './XmlInlineFlagDefinition.js';
import XmlModelContainerSupport from './XmlModelContainerSupport.js';

class InternalAssemblyDefinition extends inlineNamedDefineable(AbstractAssemblyDefinition) {
    protected readonly xml;
    private readonly parsed;
    private readonly parent;
    getInlineInstance() {
        return this.parent;
    }

    getModuleScope() {
        return ModuleScope.LOCAL;
    }

    getRootName() {
        return undefined;
    }

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

    getFlagInstances() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-flag'];
    }

    private _modelContainer: XmlModelContainerSupport | undefined;
    protected get modelContainer(): XmlModelContainerSupport {
        if (this._modelContainer === undefined) {
            this._modelContainer = new XmlModelContainerSupport(this.xml, this);
        }

        return this._modelContainer;
    }

    getAssemblyInstances(): Map<string, AbstractAssemblyInstance> {
        return this.modelContainer.assemblyInstances;
    }

    getChoiceInstances() {
        return this.modelContainer.choiceInstances;
    }

    getFieldInstances() {
        return this.modelContainer.fieldInstances;
    }

    getModelInstances() {
        return this.modelContainer.modelInstances;
    }

    getNamedModelInstances() {
        return this.modelContainer.namedModelInstances;
    }

    hasJsonKey() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-key'] !== undefined;
    }

    getJsonKeyFlagInstance() {
        return this.this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-key']
            ? this.getFlagInstances().get(
                  this.this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-key'],
              )
            : undefined;
    }

    getContainingMetaschema() {
        return this.getInlineInstance().getContainingMetaschema();
    }

    constructor(assemblyDefinitionXml: HTMLElement, parent: XmlInlineAssemblyDefinition) {
        super();
        this.parent = parent;
        this.xml = assemblyDefinitionXml;

        this.parsed = processElement(
            assemblyDefinitionXml,
            {
                name: NAMED_DEFINITION.ATTRIBUTES.name,
            },
            {
                ...NAMED_DEFINITION.CHILDREN,
                ...NAMED_MODEL_DEFINITION.CHILDREN,
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-flag': (children) => {
                    const flags = new Map();
                    children.forEach((child) => {
                        const flag = new XmlInlineFlagDefinition(child, this);
                        flags.set(flag.getEffectiveName(), flag);
                    });
                    return flags;
                },
            },
        );
    }
}

export default class XmlInlineAssemblyDefinition extends AbstractAssemblyInstance {
    private readonly internalAssemblyDefinition;
    getDefinition() {
        return this.internalAssemblyDefinition;
    }

    getName() {
        return this.getDefinition().getName();
    }

    getUseName() {
        return this.getDefinition().getUseName();
    }

    getRemarks() {
        return this.getDefinition().getRemarks();
    }

    private readonly parsed;

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

    constructor(assemblyDefinitionXml: HTMLElement, parent: AbstractAssemblyDefinition) {
        super(parent);
        this.internalAssemblyDefinition = new InternalAssemblyDefinition(assemblyDefinitionXml, this);
        this.parsed = processElement(assemblyDefinitionXml, MODEL_INSTANCE.ATTRIBUTES, MODEL_INSTANCE.CHILDREN);
    }
}
