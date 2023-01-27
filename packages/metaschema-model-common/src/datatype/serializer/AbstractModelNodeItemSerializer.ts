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

import INamedModelDefinition from '../../definition/INamedModelDefinition.js';
import INamedModelInstance from '../../instance/INamedModelInstance.js';
import { UnconstrainedModelNodeItem } from '../item/AbstractModelNodeItem.js';
import { UnconstrainedFlagItem } from '../item/FlagItem.js';
import AbstractNodeItemSerializer from './AbstractNodeItemSerializer.js';
import FlagItemSerializer from './FlagItemSerializer.js';
import { isJSONObject, JSONObject, JSONValue } from './util.js';

export default abstract class AbstractModelNodeItemSerializer<
    ModelNodeItem extends UnconstrainedModelNodeItem,
    Definition extends INamedModelDefinition,
    Instance extends INamedModelInstance,
> extends AbstractNodeItemSerializer<ModelNodeItem, Definition, Instance> {
    // TODO: Cache child serializers? Maybe in a parent "document serializer"

    protected readXmlFlags(element: Element): ModelNodeItem['value']['flags'] {
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

    protected readJsonFlags(object: JSONObject): ModelNodeItem['value']['flags'] {
        const flagItems: Record<string, UnconstrainedFlagItem> = {};
        for (const flagInstance of this.definition.getFlagInstances().values()) {
            const flagItemSerializer = new FlagItemSerializer(flagInstance);

            const attr = object[flagInstance.getJsonName()];
            if (attr === null) {
                if (flagInstance.isRequired()) {
                    throw new Error('Flag attribute marked as required');
                } else {
                    continue;
                }
            }
            flagItems[flagInstance.getEffectiveName()] = flagItemSerializer.readJson(attr);
        }

        return flagItems;
    }

    protected writeXmlFlags(item: ModelNodeItem, element: Element, document: Document): void {
        for (const flagItem of Object.values(item.value.flags)) {
            const flagItemSerializer = new FlagItemSerializer(flagItem.instance ?? flagItem.definition);
            element.setAttributeNode(flagItemSerializer.writeXml(flagItem, document));
        }
    }

    protected writeJsonFlags(item: ModelNodeItem, object: JSONObject): void {
        for (const flagItem of Object.values(item.value.flags)) {
            if (this.definition.getJsonKeyFlagInstance() === flagItem.instance && flagItem.instance !== undefined) {
                // TODO: do JSON Key values get excluded from written flags? Assuming yes
                continue;
            }
            const flagItemSerializer = new FlagItemSerializer(flagItem.instance ?? flagItem.definition);
            object[(flagItem.instance ?? flagItem.definition).getJsonName()] = flagItemSerializer.writeJson(flagItem);
        }
    }

    protected getJsonValueKeyName(flags: ModelNodeItem['value']['flags']): string {
        const jsonKeyFlagName = (this.instance ?? this.definition).getJsonKeyFlagInstance()?.getEffectiveName();
        if (jsonKeyFlagName) {
            // TODO: Cache serializers?
            const flag = flags[jsonKeyFlagName];
            if (flag) {
                return flag.definition.getDatatypeAdapter().writeString(flag);
            }
        }

        return this.definition.getJsonName();
    }

    protected abstract readXmlModel(node: Element, flags: ModelNodeItem['value']['flags']): ModelNodeItem;
    protected abstract readJsonModel(object: JSONObject, flags: ModelNodeItem['value']['flags']): ModelNodeItem;
    protected abstract writeXmlModel(item: ModelNodeItem, element: Element, document: Document): void;
    protected abstract writeJsonModel(item: ModelNodeItem, object: JSONObject): void;

    readXml(raw: Node): ModelNodeItem {
        if (!(raw instanceof Element)) {
            throw new Error('Node must be of type element');
        }

        return this.readXmlModel(raw, this.readXmlFlags(raw));
    }

    readJson(raw: JSONValue): ModelNodeItem {
        if (!isJSONObject(raw)) {
            throw new Error('JSON value must be of type JSONObject');
        }

        return this.readJsonModel(raw, this.readJsonFlags(raw));
    }

    writeXml(item: ModelNodeItem, document: Document): Element {
        const element = document.createElementNS(
            item.instance?.getXmlNamespace() ?? item.definition.getContainingMetaschema().xmlNamespace,
            this.definition.getEffectiveName(),
        );
        this.writeXmlFlags(item, element, document);
        this.writeXmlModel(item, element, document);
        return element;
    }

    writeJson(item: ModelNodeItem): JSONObject {
        const object: JSONObject = {};
        this.writeJsonFlags(item, object);
        this.writeJsonModel(item, object);
        return object;
    }
}
