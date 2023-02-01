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
import { UnconstrainedFlagsContainer } from '../item/AbstractModelNodeItem.js';
import AssemblyItem, { UnconstrainedAssemblyContainer, UnconstrainedAssemblyItem } from '../item/AssemblyItem.js';
import { UnconstrainedFieldItem } from '../item/FieldItem.js';
import AbstractModelNodeItemSerializer from './AbstractModelNodeItemSerializer.js';
import FieldItemSerializer from './FieldItemSerializer.js';
import { isJSONObject, JSONValue } from './util.js';

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

    readJson(raw: JSONValue, pointer: string): AssemblyItem<Value, Flags> {
        if (!isJSONObject(raw)) {
            throw new Error('Could not parse assembly, expected JSON object, got JSON primitive or list');
        }

        const flags = this.readJsonFlags(raw, pointer);
        const model: Record<string, UnconstrainedAssemblyItem | UnconstrainedFieldItem> = {};

        // TODO: handle json-key and json-key flag

        for (const assemblyInstance of this.definition.getAssemblyInstances().values()) {
            const key = assemblyInstance.getJsonName();
            const assemblyItemSerializer = new AssemblyItemSerializer(assemblyInstance);
            const assembly = raw[key];
            if (assembly === null) {
                // TODO: can an assembly be required?
                continue;
            }
            model[assemblyInstance.getEffectiveName()] = assemblyItemSerializer.readJson(assembly, pointer + '/' + key);
        }

        for (const fieldInstance of this.definition.getFieldInstances().values()) {
            const key = fieldInstance.getJsonName();
            const fieldItemSerializer = new FieldItemSerializer(fieldInstance);
            const field = raw[key];
            if (field === null) {
                // TODO: can a field be required?
                continue;
            }
            model[fieldInstance.getEffectiveName()] = fieldItemSerializer.readJson(field, pointer + '/' + key);
        }

        // TODO: figure out what to do with choices?
        // for (const choiceInstance of this.definition.getChoiceInstances().values()) {
        // }

        return new AssemblyItem(
            {
                // TODO: the type definitions are definitely not correct
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