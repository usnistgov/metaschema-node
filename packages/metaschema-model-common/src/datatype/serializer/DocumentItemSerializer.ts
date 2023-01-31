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
import { AssemblyItem, DocumentItem } from '../index.js';
import { UnconstrainedFlagsContainer } from '../item/AbstractModelNodeItem.js';
import { UnconstrainedAssemblyContainer } from '../item/AssemblyItem.js';
import AbstractSerializer from './AbstractSerializer.js';
import AssemblyItemSerializer from './AssemblyItemSerializer.js';
import { isJSONObject, JSONValue } from './util.js';

export default class DocumentItemSerializer<
    Value extends UnconstrainedAssemblyContainer,
    Flags extends UnconstrainedFlagsContainer,
> extends AbstractSerializer<DocumentItem<AssemblyItem<Value, Flags>>> {
    // TODO: how to accurately enforce type signatures here?
    // TODO: caching (do we implement caching top down here?)

    protected readonly metaschema;
    // TODO: remove this
    protected readonly documentUri;

    readXml(raw: Node): DocumentItem<AssemblyItem<Value, Flags>> {
        throw new Error('Method not implemented.');
    }

    readJson(raw: JSONValue): DocumentItem<AssemblyItem<Value, Flags>> {
        if (!isJSONObject(raw)) {
            throw new Error('Could not parse document, expected JSON Object, got JSON value');
        }

        if (Object.keys(raw).length !== 1) {
            throw new Error('Document object must have exactly one child');
        }

        const rootAssemblyName = Object.keys(raw)[0];

        const rootAssemblyDef = this.metaschema.rootAssemblyDefinitions.get(rootAssemblyName);
        if (rootAssemblyDef === undefined) {
            throw new Error('Root assembly definition not found');
        }

        const rootAssemblyItemSerializer = new AssemblyItemSerializer(rootAssemblyDef);

        const rootAssemblyItem = rootAssemblyItemSerializer.readJson(raw[rootAssemblyName], rootAssemblyName);

        return new DocumentItem(rootAssemblyItem, this.documentUri) as DocumentItem<AssemblyItem<Value, Flags>>;
    }

    writeXml(item: DocumentItem<AssemblyItem<Value, Flags>>, document: Document): Node {
        throw new Error('Method not implemented.');
    }

    writeJson(item: DocumentItem<AssemblyItem<Value, Flags>>): JSONValue {
        throw new Error('Method not implemented.');
    }

    constructor(metaschema: AbstractMetaschema, documentUri: string) {
        super();
        this.metaschema = metaschema;
        this.documentUri = documentUri;
    }
}
