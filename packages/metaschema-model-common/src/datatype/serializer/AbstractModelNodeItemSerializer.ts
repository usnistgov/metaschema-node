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
import INamedModelDefinition from '../../definition/INamedModelDefinition.js';
import INamedModelInstance from '../../instance/INamedModelInstance.js';
import { UnconstrainedModelNodeItem } from '../item/AbstractModelNodeItem.js';
import { UnconstrainedFlagItem } from '../item/FlagItem.js';
import AbstractNodeItemSerializer from './AbstractNodeItemSerializer.js';
import FlagItemSerializer from './FlagItemSerializer.js';
import { isJSONObject, JSONObject, JSONValue } from './util.js';

/**
 * This abstract class provides helpers for serializers designed for children
 * of {@link AbstractModelNodeItem}.
 *
 * This class provides helpers for reading and writing flag values.
 */
export default abstract class AbstractModelNodeItemSerializer<
    ModelNodeItem extends UnconstrainedModelNodeItem,
    Definition extends INamedModelDefinition,
    Instance extends INamedModelInstance,
> extends AbstractNodeItemSerializer<ModelNodeItem, Definition, Instance> {
    // TODO: Cache child serializers? Maybe in a parent "document serializer"

    protected parentKeyFromPointer(pointer: string): string | undefined {
        if (!pointer.startsWith('/') && pointer !== '') {
            throw new Error(`Invalid path '${pointer}', must start with a '/'`);
        }

        return pointer
            .split('/')
            .reverse()
            .find((key) => key !== '' && Number.isNaN(key));
    }

    /**
     * For JSON object, return the key to be used by a parent model serializer
     * to set the key of the current model node item.
     */
    public getJsonKeyName(flags: ModelNodeItem['flags']): string | undefined {
        const keyFlag = this.definition.getJsonKeyFlagInstance();
        if (keyFlag) {
            const flag = flags[keyFlag.getEffectiveName()];
            if (flag) {
                return flag.definition.getDatatypeAdapter().writeString(flag.value);
            } else {
                // TODO: come up with a better error here
                throw new Error('JSON key name in definition, but not in flags');
            }
        }

        return this.definition.getJsonName();
    }

    /**
     * Given an {@link Element}, reads all flags in the definition
     */
    protected readXmlFlags(element: Element): ModelNodeItem['flags'] {
        const flagItems: Record<string, UnconstrainedFlagItem> = {};
        for (const flagInstance of this.definition.getFlagInstances().values()) {
            const flagItemSerializer = new FlagItemSerializer(flagInstance);

            const attr = element.getAttributeNode(flagInstance.getJsonName());
            if (attr === null) {
                if (flagInstance.isRequired()) {
                    throw new Error('Flag attribute marked as required');
                } else {
                    continue;
                }
            }
            flagItems[flagInstance.getEffectiveName()] = flagItemSerializer.readXml(attr);
        }

        return flagItems;
    }

    /**
     * Given a {@link JSONValue}, reads all flags in the definition.
     *
     * Note: the parent key must be passed in in order to parse a flag marked as a json key.
     */
    protected readJsonFlags(raw: JSONValue, pointer: string): ModelNodeItem['flags'] {
        const flagItems: Record<string, UnconstrainedFlagItem> = {};
        for (const flagInstance of this.definition.getFlagInstances().values()) {
            let rawFlagValue: JSONValue;
            let rawFlagPointer: string;
            if (flagInstance === this.definition.getJsonKeyFlagInstance()) {
                const parentKey = this.parentKeyFromPointer(pointer);
                if (parentKey === undefined) {
                    throw new Error('json key flag cannot be used at root of document');
                }
                rawFlagValue = parentKey;
                rawFlagPointer = pointer;
            } else if (
                this.definition instanceof AbstractFieldDefinition &&
                flagInstance === this.definition.getJsonValueKeyFlagInstance()
            ) {
                if (!isJSONObject(raw)) {
                    // Special case, fields can be "promoted" to their child value in json
                    throw new Error(
                        'JSON value key flag could not be determined, field is erroneously promoted or malformed',
                    );
                }

                // TODO: align this to Dave's formal specification (TBA)

                // find all relevant flag names
                const flagKeys = [...this.definition.getFlagInstances().values()]
                    // json key flag and json value key flag are not represented in the json document
                    .filter((f) => {
                        return f !== flagInstance && f !== this.definition.getJsonKeyFlagInstance();
                    })
                    .map((f) => f.getJsonName());
                // find properties in the json object that aren't flags
                const candidates = Object.getOwnPropertyNames(raw).filter((key) => !flagKeys.includes(key));
                // TODO: determine behavior if >1 property exists
                if (candidates.length !== 1) {
                    throw new Error('Extraneous JSON keys makes JSON value key indeterminate');
                }

                rawFlagValue = raw[candidates[0]];
                rawFlagPointer = pointer + '/' + candidates[0];
            } else {
                if (!isJSONObject(raw)) {
                    throw new Error('Regular flags can only be extracted from JSON objects');
                }

                rawFlagPointer = pointer + '/' + flagInstance.getJsonName();
                const attr = raw[flagInstance.getJsonName()];
                if (attr === null) {
                    if (flagInstance.isRequired()) {
                        throw new Error('Flag attribute marked as required');
                    } else {
                        continue;
                    }
                }
                rawFlagValue = attr;
            }

            const flagItemSerializer = new FlagItemSerializer(flagInstance);
            flagItems[flagInstance.getEffectiveName()] = flagItemSerializer.readJson(rawFlagValue, rawFlagPointer);
        }

        return flagItems;
    }

    /**
     * Given a {@link ModelNodeItem}, append all flags as attributes of the
     * passed in {@link Element}.
     */
    protected writeXmlFlags(item: ModelNodeItem, element: Element, document: Document): void {
        for (const flagItem of Object.values(item.value.flags)) {
            const flagItemSerializer = new FlagItemSerializer(flagItem.instance ?? flagItem.definition);
            element.setAttributeNode(flagItemSerializer.writeXml(flagItem, document));
        }
    }

    /**
     * Given a {@link ModelNodeItem}, append all flags excluding json key and
     * json value key flags to the passed in {@link JSONObject}.
     */
    protected writeJsonFlags(item: ModelNodeItem, object: JSONObject): void {
        for (const flagItem of Object.values(item.value.flags)) {
            // json key flag and json value key flag are not expressed in JSON object
            if (
                (flagItem.instance && this.definition.getJsonKeyFlagInstance() === flagItem.instance) ||
                (this.definition instanceof AbstractFieldDefinition &&
                    flagItem.instance &&
                    this.definition.getJsonValueKeyFlagInstance() === flagItem.instance)
            ) {
                continue;
            }
            const flagItemSerializer = new FlagItemSerializer(flagItem.instance ?? flagItem.definition);
            object[(flagItem.instance ?? flagItem.definition).getJsonName()] = flagItemSerializer.writeJson(flagItem);
        }
    }
}
