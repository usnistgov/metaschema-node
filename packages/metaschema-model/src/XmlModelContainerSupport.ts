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

import { forEachChild, processElement, requireOneChild } from '@oscal/data-utils';
import { AbstractAssemblyDefinition } from '@oscal/metaschema-model-common/definition';
import {
    AbstractAssemblyInstance,
    AbstractChoiceInstance,
    AbstractFieldInstance,
    IModelInstance,
    INamedModelInstance,
} from '@oscal/metaschema-model-common/instance';
import XmlAssemblyInstance from './XmlAssemblyInstance.js';
import XmlChoiceInstance from './XmlChoiceInstance.js';
import XmlFieldInstance from './XmlFieldInstance.js';
import XmlInlineAssemblyDefinition from './XmlInlineAssemblyDefinition.js';
import XmlInlineFieldDefinition from './XmlInlineFieldDefinition.js';

/**
 * This utility class supports Assembly and Choice object types in collecting child instances.
 */
export default class XmlModelContainerSupport {
    _fieldInstances: Map<string, AbstractFieldInstance>;
    get fieldInstances() {
        return this._fieldInstances;
    }

    _assemblyInstances: Map<string, AbstractAssemblyInstance>;
    get assemblyInstances() {
        return this._assemblyInstances;
    }

    _choiceInstances: AbstractChoiceInstance[];
    get choiceInstances(): AbstractChoiceInstance[] {
        return this._choiceInstances;
    }

    get modelInstances(): IModelInstance[] {
        return [...this.fieldInstances.values(), ...this.assemblyInstances.values(), ...this.choiceInstances];
    }

    get namedModelInstances() {
        return new Map<string, INamedModelInstance>([...this.assemblyInstances, ...this.fieldInstances]);
    }

    constructor(xmlContent: Element, containingAssembly: AbstractAssemblyDefinition) {
        this._fieldInstances = new Map();
        this._assemblyInstances = new Map();
        this._choiceInstances = [];

        if (xmlContent.tagName === 'choice') {
            this.parseChoice(xmlContent, containingAssembly);
        } else {
            this.parseModel(xmlContent, containingAssembly);
        }
    }

    private processChoiceChildren(containingAssembly: AbstractAssemblyDefinition) {
        return {
            '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}assembly': forEachChild((child) => {
                const assembly = new XmlAssemblyInstance(child, containingAssembly);
                this._assemblyInstances.set(assembly.getEffectiveName(), assembly);
            }),
            '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-assembly': forEachChild((child) => {
                const assembly = new XmlInlineAssemblyDefinition(child, containingAssembly);
                this._assemblyInstances.set(assembly.getEffectiveName(), assembly);
            }),
            '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}field': forEachChild((child) => {
                const field = new XmlFieldInstance(child, containingAssembly);
                this._fieldInstances.set(field.getEffectiveName(), field);
            }),
            '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-field': forEachChild((child) => {
                const field = new XmlInlineFieldDefinition(child, containingAssembly);
                this._fieldInstances.set(field.getEffectiveName(), field);
            }),
        };
    }

    private parseChoice(xmlContent: Element, containingAssembly: AbstractAssemblyDefinition) {
        processElement(xmlContent, {}, this.processChoiceChildren(containingAssembly));
    }

    private parseModel(xmlContent: Element, containingAssembly: AbstractAssemblyDefinition) {
        processElement(
            xmlContent,
            {},
            {
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}model': requireOneChild((child) =>
                    processElement(
                        child,
                        {},
                        {
                            // Model parsing shares most items with Choice parsing
                            ...this.processChoiceChildren(containingAssembly),
                            '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}choice': forEachChild((child) =>
                                this._choiceInstances.push(new XmlChoiceInstance(child, containingAssembly)),
                            ),
                        },
                    ),
                ),
            },
        );
    }
}
