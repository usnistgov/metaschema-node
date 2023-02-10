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

import AbstractFieldDefinition from '../../definition/AbstractFieldDefinition.js';
import AbstractFieldInstance from '../../instance/AbstractFieldInstance.js';
import { FieldItem } from '../index.js';
import { UnconstrainedFlagsContainer } from '../item/AbstractModelNodeItem.js';
import AbstractModelNodeItemSerializer from './AbstractModelNodeItemSerializer.js';
import { isJSONObject, JSONObject, JSONValue } from './util.js';

export default class FieldItemSerializer<
    Value,
    Flags extends UnconstrainedFlagsContainer,
> extends AbstractModelNodeItemSerializer<FieldItem<Value, Flags>, AbstractFieldDefinition, AbstractFieldInstance> {
    /**
     * For JSON objects, return the value key to be used by the model
     * serializer or undefined if the object has been promoted.
     */
    protected getJsonValueKeyName(flags: Flags): string | undefined {
        if ((this.instance ?? this.definition).isSimple()) {
            return undefined;
        }

        const valueKey = this.definition.getJsonValueKey();
        if (typeof valueKey === 'string') {
            return valueKey;
        }

        const flag = flags[valueKey.getEffectiveName()];
        if (flag) {
            return flag.definition.getDatatypeAdapter().writeString(flag.value);
        } else {
            // TODO: come up with a better error here
            throw new Error('JSON value key name in definition, but not in flags');
        }
    }

    readXml(raw: Node): FieldItem<Value, Flags> {
        if (!(raw instanceof Element)) {
            throw new Error('Node must be of type element');
        }

        return new FieldItem(
            {
                model: this.definition.getDatatypeAdapter().readXml(raw),
                flags: this.readXmlFlags(raw),
            },
            this.instance ?? this.definition,
        ) as FieldItem<Value, Flags>;
    }

    readJson(raw: JSONValue, pointer: string): FieldItem<Value, Flags> {
        const flags = this.readJsonFlags(raw, pointer);
        let model: FieldItem<Value, Flags>['model'];

        const valueKey = this.getJsonValueKeyName(flags);
        if (valueKey) {
            if (!isJSONObject(raw)) {
                throw new Error('Could not parse field flags, expected JSON object, got JSON primitive or list');
            }
            model = this.definition.getDatatypeAdapter().readJson(raw[valueKey], pointer + '/' + valueKey) as FieldItem<
                Value,
                Flags
            >['model'];
        } else {
            model = this.definition.getDatatypeAdapter().readString(raw?.toString() ?? '') as FieldItem<
                Value,
                Flags
            >['model'];
        }

        return new FieldItem(
            {
                model,
                flags,
            },
            this.instance ?? this.definition,
        ) as FieldItem<Value, Flags>;
    }

    writeXml(item: FieldItem<Value, Flags>, document: Document): Node {
        const element = document.createElementNS(
            item.instance?.getXmlNamespace() ?? item.definition.getContainingMetaschema().xmlNamespace,
            this.definition.getEffectiveName(),
        );
        this.writeXmlFlags(item, element, document);
        // TODO: Handle XML wrapping?
        element.appendChild(this.definition.getDatatypeAdapter().writeXml(item.value.model, document));
        return element;
    }

    writeJson(item: FieldItem<Value, Flags>): JSONValue {
        const valueKey = this.getJsonValueKeyName(item.value.flags);
        if (valueKey) {
            const object: JSONObject = {};
            this.writeJsonFlags(item, object);
            object[valueKey] = this.definition.getDatatypeAdapter().writeJson(item.model);
            return object;
        } else {
            return this.definition.getDatatypeAdapter().writeString(item.model);
        }
    }
}
