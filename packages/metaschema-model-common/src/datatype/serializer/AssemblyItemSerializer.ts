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

import AbstractAssemblyDefinition from '../../definition/AbstractAssemblyDefinition.js';
import AbstractAssemblyInstance from '../../instance/AbstractAssemblyInstance.js';
import AbstractChoiceInstance from '../../instance/AbstractChoiceInstance.js';
import AbstractFieldInstance from '../../instance/AbstractFieldInstance.js';
import INamedModelInstance from '../../instance/INamedModelInstance.js';
import { UnconstrainedFlagsContainer } from '../item/AbstractModelNodeItem.js';
import AssemblyItem, { UnconstrainedAssemblyContainer, UnconstrainedAssemblyItem } from '../item/AssemblyItem.js';
import { UnconstrainedFieldItem } from '../item/FieldItem.js';
import AbstractModelNodeItemSerializer from './AbstractModelNodeItemSerializer.js';
import FieldItemSerializer from './FieldItemSerializer.js';
import { isJSONObject, JSONObject, JSONValue } from './util.js';

export default class AssemblyItemSerializer<
    Value extends UnconstrainedAssemblyContainer,
    Flags extends UnconstrainedFlagsContainer,
> extends AbstractModelNodeItemSerializer<
    AssemblyItem<Value, Flags>,
    AbstractAssemblyDefinition,
    AbstractAssemblyInstance
> {
    // TODO: Cache child serializers? Maybe in a parent "document serializer"

    // TODO: Handle collapsing

    readXml(raw: Node): AssemblyItem<Value, Flags> {
        throw new Error('Method not implemented.');
    }

    protected readJsonChildModel(
        raw: JSONObject,
        pointer: string,
        instance: INamedModelInstance,
    ): UnconstrainedAssemblyItem | UnconstrainedFieldItem | undefined {
        let serializer;
        if (instance instanceof AbstractAssemblyInstance) {
            serializer = new AssemblyItemSerializer(instance);
        } else if (instance instanceof AbstractFieldInstance) {
            serializer = new FieldItemSerializer(instance);
        } else {
            throw new Error('Child model must be instance of assembly or field');
        }

        const key = instance.getJsonName();

        const rawChildPointer = pointer + '/' + key;
        const rawChild = raw[key];
        if (rawChild === undefined) {
            if (instance.getMinOccurs() !== 0) {
                // TODO: is the correct way to do this
                throw new Error('Required item not found');
            }
            return undefined;
        }

        return serializer.readJson(rawChild, rawChildPointer);
    }

    protected readJsonChoice(
        raw: JSONObject,
        pointer: string,
        choiceInstance: AbstractChoiceInstance,
    ): { item: UnconstrainedAssemblyItem | UnconstrainedFieldItem; effectiveName: string } | undefined {
        // TODO: definitively, we do not handle choices of choices?
        for (const candidateInstance of choiceInstance.getNamedModelInstances().values()) {
            try {
                const item = this.readJsonChildModel(raw, pointer, candidateInstance);
                if (item) {
                    return {
                        item,
                        effectiveName: candidateInstance.getEffectiveName(),
                    };
                }
            } catch {
                // Not actually existing is a feature of choices
            }
        }

        // No choices were valid
        return undefined;
    }

    readJson(raw: JSONValue, pointer: string): AssemblyItem<Value, Flags> {
        if (!isJSONObject(raw)) {
            throw new Error('Could not parse assembly, expected JSON object, got JSON primitive or list');
        }

        const flags = this.readJsonFlags(raw, pointer);
        const model: Record<string, UnconstrainedAssemblyItem | UnconstrainedFieldItem> = {};

        // TODO: handle json-key flag

        for (const childInstance of this.definition.getNamedModelInstances().values()) {
            const childItem = this.readJsonChildModel(raw, pointer, childInstance);
            if (childItem) {
                model[childInstance.getEffectiveName()] = childItem;
            }
        }

        for (const choiceInstance of this.definition.getChoiceInstances().values()) {
            const child = this.readJsonChoice(raw, pointer, choiceInstance);
            if (child) {
                model[child.effectiveName] = child.item;
            }
        }

        return new AssemblyItem(
            {
                model: model as AssemblyItem<Value, Flags>['model'],
                flags,
            },
            this.instance ?? this.definition,
        );
    }

    writeXml(item: AssemblyItem<Value, Flags>, document: Document): Node {
        throw new Error('Method not implemented.');
    }

    writeJson(item: AssemblyItem<Value, Flags>): JSONValue {
        throw new Error('Method not implemented.');
    }
}
