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

import AbstractMetaschema from '../../AbstractMetaschema.js';
import { DocumentItem } from '../index.js';
import { UnconstrainedAssemblyItem } from '../item/AssemblyItem.js';
import AbstractSerializer from './AbstractSerializer.js';
import AssemblyItemSerializer from './AssemblyItemSerializer.js';
import { isJSONObject, JSONObject, JSONValue } from './util.js';

export default class DocumentItemSerializer<Assembly extends UnconstrainedAssemblyItem> extends AbstractSerializer<
    DocumentItem<Assembly>
> {
    // TODO: caching (do we implement caching top down here?)

    protected readonly metaschema;

    readXml(raw: Node): DocumentItem<Assembly> {
        if (!(raw instanceof Document)) {
            throw new Error('Node must be of type document');
        }

        const documentElement = raw.documentElement;
        if (documentElement.namespaceURI !== this.metaschema.xmlNamespace) {
            throw new Error('Document element is not in correct namespace');
        }

        const rootAssemblyDefinition = this.metaschema.rootAssemblyDefinitions.get(documentElement.tagName);
        if (rootAssemblyDefinition === undefined) {
            throw new Error('Root assembly definition not found');
        }

        const rootAssemblyItemSerializer = new AssemblyItemSerializer(rootAssemblyDefinition);
        const rootAssemblyItem = rootAssemblyItemSerializer.readXml(documentElement);
        return new DocumentItem(rootAssemblyItem, this.metaschema.location) as DocumentItem<Assembly>;
    }

    /**
     * @param pointer is ignored.
     */
    readJson(raw: JSONValue, pointer?: string): DocumentItem<Assembly> {
        if (!isJSONObject(raw)) {
            throw new Error('Could not parse document, expected JSON Object, got JSON value');
        }

        if (Object.keys(raw).length !== 1) {
            throw new Error('Document object must have exactly one child');
        }

        if (pointer && pointer !== '/') {
            console.warn('Pointer value is ignored on document item serializers');
        }

        const rootAssemblyName = Object.keys(raw)[0];
        const rootAssemblyDefinition = [...this.metaschema.rootAssemblyDefinitions.values()].find(
            (definition) => definition.getRootJsonName() === rootAssemblyName,
        );

        if (rootAssemblyDefinition === undefined) {
            throw new Error('Root assembly definition not found');
        }

        const rootAssemblyItemSerializer = new AssemblyItemSerializer(rootAssemblyDefinition);
        const rootAssemblyItem = rootAssemblyItemSerializer.readJson(raw[rootAssemblyName], '/' + rootAssemblyName);
        return new DocumentItem(rootAssemblyItem, this.metaschema.location) as DocumentItem<Assembly>;
    }

    /**
     * Writes an XML document or replaces the document element of an existing document.
     *
     * Passing in an existing document allows you to override the DOM implementation.
     *
     * @param document If not specified, a new document is created
     */
    writeXml(item: DocumentItem<Assembly>, document?: Document): Document {
        const rootAssemblyItemSerializer = new AssemblyItemSerializer(item.root.instance ?? item.root.definition);

        if (document === undefined) {
            document = new DOMImplementation().createDocument(this.metaschema.xmlNamespace, 'temp');
        }

        document.replaceChild(document.documentElement, rootAssemblyItemSerializer.writeXml(item.root, document));
        return document;
    }

    writeJson(item: DocumentItem<Assembly>): JSONObject {
        const rootAssemblyItemSerializer = new AssemblyItemSerializer(item.root.instance ?? item.root.definition);
        const rootAssemblyItem = rootAssemblyItemSerializer.writeJson(item.root);
        const raw: JSONObject = {};
        raw[(item.root.instance ?? item.root.definition).getJsonName()] = rootAssemblyItem;
        return raw;
    }

    constructor(metaschema: AbstractMetaschema) {
        super();
        this.metaschema = metaschema;
    }
}
