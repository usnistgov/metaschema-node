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
import { XMLParser } from 'fast-xml-parser';
import { ResourceResolver } from './resolver.js';
import { JSONObject, parseArrayOrObjectProp, parseObjectProp, parseStringProp } from './util.js';

export default class XmlMetaschema extends AbstractMetaschema {
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

    constructor(location: string, parsedXmlMetaschema: JSONObject, importedMetaschemas: AbstractMetaschema[]) {
        super(importedMetaschemas);
        this.location = location;

        this.parsedXmlMetaschema = parsedXmlMetaschema;

        this._flagDefinitions = new Map();
        this._fieldDefinitions = new Map();
        this._assemblyDefinitions = new Map();
    }

    /**
     * Load a Metaschema from a file location
     * @param location The location to load the metaschema from
     * @param resolver A function that returns the raw XML string from a specified location
     * @param loaded The map of previously loaded metaschemas (do not use externally)
     * @param seen The set of previously seen metaschemas (do not use externally)
     * @returns The loaded metaschema with all imports
     */
    static async load(
        location: string,
        resolver: ResourceResolver,
        loaded?: Record<string, XmlMetaschema>,
        seen?: Set<string>,
    ): Promise<XmlMetaschema> {
        // initialize loaded and seen if base case
        if (loaded === undefined) {
            loaded = {};
        }
        if (seen === undefined) {
            seen = new Set();
        }

        // attempt to return early if this metaschema has already been loaded
        const shortCircuitAttempt = loaded[location];
        if (shortCircuitAttempt) {
            return shortCircuitAttempt;
        }

        // check for infinite loops
        if (seen.has(location)) {
            const seenStr = [...seen.values()].join(', ');
            const loadedStr = Object.keys(loaded).join(', ');
            throw new Error(`import loop detected importing ${location} (seen: ${seenStr}; loaded: ${loadedStr})`);
        }

        // add current location to seen set to prevent infinite loops
        seen.add(location);

        const raw = await resolver(location);
        const parsedXml = this.parse(raw);
        const parsedXmlMetaschema = parseObjectProp('METASCHEMA', '*root*', parsedXml);
        // get all imports, and recursively import metaschemas for those imports
        const importLocs = this.parseImports(parsedXmlMetaschema);
        const imports = [];
        for (const importLoc of importLocs) {
            const imported = await this.load(importLoc, resolver, loaded, seen);
            // allow future metaschemas to short-circuit imports
            loaded[importLoc] = imported;
            imports.push(imported);
        }

        return new this(location, parsedXmlMetaschema, imports);
    }

    /**
     * Parse a raw XML string into a JS object consumable by `XmlMetaschema`
     * @param raw Raw XML to parse into JS objects
     */
    private static parse(raw: string | Buffer) {
        const parser = new XMLParser({ ignoreAttributes: false });
        return parser.parse(raw);
    }

    /**
     * Given a parsed METASCHEMA XML tag, get all required imports.
     * @param parsedXmlMetaschema The parsed METASHEMA XML tag parsed into JSON
     * @returns A list of relative or absolute import URIs that must be provided to a given metaschema
     */
    private static parseImports(parsedXmlMetaschema: JSONObject): string[] {
        if (!('import' in parsedXmlMetaschema)) {
            // no import objects
            return [];
        }

        // fastXML returns an object if only one import is returned
        return parseArrayOrObjectProp('import', 'METASCHEMA', parsedXmlMetaschema).map((parsedXmlImport) => {
            if (!(parsedXmlImport && typeof parsedXmlImport === 'object' && !Array.isArray(parsedXmlImport))) {
                throw new Error('import array item is not of object type');
            }
            return parseStringProp('@_href', 'import', parsedXmlImport);
        });
    }
}
