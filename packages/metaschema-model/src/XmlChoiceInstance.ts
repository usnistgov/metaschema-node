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

import { AbstractAssemblyDefinition } from '@oscal/metaschema-model-common/definition';
import { AbstractAssemblyInstance, AbstractChoiceInstance } from '@oscal/metaschema-model-common/instance';
import XmlModelContainerSupport from './XmlModelContainerSupport.js';

export default class XmlChoiceInstance extends AbstractChoiceInstance {
    getGroupAsName() {
        return undefined;
    }

    getRemarks() {
        // TODO: add support if remarks are added
        return undefined;
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

    private readonly choiceInstanceXml;
    private readonly containingAssembly;
    private _modelContainer: XmlModelContainerSupport | undefined;
    protected get modelContainer() {
        if (this._modelContainer === undefined) {
            this._modelContainer = new XmlModelContainerSupport(this.choiceInstanceXml, this.containingAssembly);
        }

        return this._modelContainer;
    }

    constructor(choiceInstanceXml: HTMLElement, containingAssembly: AbstractAssemblyDefinition) {
        super(containingAssembly);
        this.choiceInstanceXml = choiceInstanceXml;
        this.containingAssembly = containingAssembly;
    }
}
