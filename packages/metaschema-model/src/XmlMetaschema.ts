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

import XmlGlobalFlagDefinition from './XmlGlobalFlagDefinition.js';
import { ResourceResolver } from './resolver.js';
import { AbstractMetaschema } from '@oscal/metaschema-model-common';
import {
    forEachChild,
    optionalOneChild,
    parseXml,
    processElement,
    requireAttribute,
    requireOneChild,
} from '@oscal/data-utils';
import { processMarkupLine, processMarkupMultiLine } from './processing/markup.js';
import XmlGlobalFieldDefinition from './XmlGlobalFieldDefinition.js';
import XmlGlobalAssemblyDefinition from './XmlGlobalAssemblyDefinition.js';

export default class XmlMetaschema extends AbstractMetaschema {
    protected xml: HTMLElement;
    private readonly parsed;

    get name() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}schema-name'];
    }

    get version() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}schema-version'];
    }

    get shortName() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}short-name'];
    }

    get xmlNamespace() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}namespace'];
    }
    get jsonBaseUri() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-base-uri'];
    }

    get remarks() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks'];
    }

    get flagDefinitions() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-flag'];
    }

    get fieldDefinitions() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-field'];
    }

    get assemblyDefinitions() {
        return this.parsed.children['{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-assembly'];
    }

    readonly location;

    constructor(location: string, metaschemaXml: HTMLElement, importedMetaschemas: AbstractMetaschema[]) {
        super(importedMetaschemas);
        this.location = location;

        this.xml = metaschemaXml;

        this.parsed = processElement(
            metaschemaXml,
            {},
            {
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}schema-name': requireOneChild(processMarkupLine),
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}schema-version': requireOneChild(
                    (child) => processElement(child, {}, {}).body,
                ),
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}short-name': requireOneChild(
                    (child) => processElement(child, {}, {}).body,
                ),
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}namespace': requireOneChild(
                    (child) => processElement(child, {}, {}).body,
                ),
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}json-base-uri': requireOneChild(
                    (child) => processElement(child, {}, {}).body,
                ),
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks': optionalOneChild(processMarkupMultiLine),
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-flag': (children, _) => {
                    const definitions = new Map();
                    children.forEach((child) => {
                        const definition = new XmlGlobalFlagDefinition(child, this);
                        definitions.set(definition.getEffectiveName(), definition);
                    });
                    return definitions;
                },
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-field': (children, _) => {
                    const definitions = new Map();
                    children.forEach((child) => {
                        const definition = new XmlGlobalFieldDefinition(child, this);
                        definitions.set(definition.getEffectiveName(), definition);
                    });
                    return definitions;
                },
                '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}define-assembly': (children, _) => {
                    const definitions = new Map();
                    children.forEach((child) => {
                        const definition = new XmlGlobalAssemblyDefinition(child, this);
                        definitions.set(definition.getEffectiveName(), definition);
                    });
                    return definitions;
                },
            },
        );
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

        // TODO: normalize location paths for consistent URIs

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
        const rootXml = parseXml(raw);
        const metaschemaXml = rootXml.documentElement;

        // get all imports, and recursively import metaschemas for those imports
        const importLocs = this.parseImports(metaschemaXml);
        const imports = [];
        for (const importLoc of importLocs) {
            const imported = await this.load(importLoc, resolver, loaded, seen);
            // allow future metaschemas to short-circuit imports
            loaded[importLoc] = imported;
            imports.push(imported);
        }

        return new this(location, metaschemaXml, imports);
    }

    /**
     * Given a parsed METASCHEMA XML tag, get all required imports.
     * @param metaschemaXml The parsed METASCHEMA XML tag parsed into JSON
     * @returns A list of relative or absolute import URIs that must be provided to a given metaschema
     */
    private static parseImports(metaschemaXml: HTMLElement): string[] {
        return processElement(
            metaschemaXml,
            {},
            {
                import: forEachChild((child) => processElement(child, { href: requireAttribute((attr) => attr) }, {})),
            },
        ).children.import.map((importElem) => importElem.attributes.href);
    }
}
