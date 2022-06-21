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
import { AbstractMetaschema } from '@oscal/metaschema-model-common';
import { MarkupMultiLine } from '@oscal/metaschema-model-common/datatype';
import {
    AbstractAssemblyDefinition,
    AbstractFieldDefinition,
    AbstractFlagDefinition,
} from '@oscal/metaschema-model-common/definition';
import { JSONObject, parseObjectProp, parseStringProp } from './util.js';

export default class XmlMetaschema extends AbstractMetaschema {
    protected parsedXml: JSONObject;
    protected parsedXmlMetaschema: JSONObject;

    get name() {
        return parseStringProp('schema-name', 'METASCHEMA', this.parsedXmlMetaschema);
    }

    get version() {
        return parseStringProp('schema-version', 'METASCHEMA', this.parsedXmlMetaschema);
    }

    get shortName() {
        return parseStringProp('short-name', 'METASCHEMA', this.parsedXmlMetaschema);
    }

    get xmlNamespace() {
        return parseStringProp('namespace', 'METASCHEMA', this.parsedXmlMetaschema);
    }

    get jsonBaseUri() {
        return parseStringProp('json-base-uri', 'METASCHEMA', this.parsedXmlMetaschema);
    }

    remarks: MarkupMultiLine | undefined;

    private _flagDefinitions: Map<string, AbstractFlagDefinition>;
    get flagDefinitions() {
        return this._flagDefinitions;
    }

    private _fieldDefinitions: Map<string, AbstractFieldDefinition>;
    get fieldDefinitions() {
        return this._fieldDefinitions;
    }

    private _assemblyDefinitions: Map<string, AbstractAssemblyDefinition>;
    get assemblyDefinitions() {
        return this._assemblyDefinitions;
    }

    readonly location;
    constructor(location: string, parsedXml: JSONObject, importedMetaschemas: AbstractMetaschema[]) {
        super(importedMetaschemas);
        this.location = location;

        this.parsedXml = parsedXml;
        this.parsedXmlMetaschema = parseObjectProp('METASCHEMA', '*root*', this.parsedXml);

        this._flagDefinitions = new Map();
        this._fieldDefinitions = new Map();
        this._assemblyDefinitions = new Map();
    }
}
