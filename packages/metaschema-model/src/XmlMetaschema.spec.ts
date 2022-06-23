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

import { ResourceResolver } from './resolver.js';
import { parseObjectPropRequired, parseXml } from './parseUtil.js';
import XmlMetaschema from './XmlMetaschema.js';

function mockResolverBuilder(locations: Record<string, string>): ResourceResolver {
    return async (location: string) => {
        return locations[location];
    };
}

describe('XmlMetaschema.load()', () => {
    it('should load the most basic Metaschema', async () => {
        const location = 'file://notreal.xml';
        const schemaName = 'Test Metaschema';
        const schemaVersion = '1.0';
        const shortName = 'test-model';
        const namespace = 'http://csrc.nist.gov/ns/metaschema/basic-test';
        const jsonBaseUri = 'http://csrc.nist.gov/ns/metaschema/basic-test';

        const metaschema = await XmlMetaschema.load(
            location,
            // fake the resolver to always return our target xml
            async (_) => `<?xml version="1.0" encoding="UTF-8"?>
            <METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>${schemaName}</schema-name>
                <schema-version>${schemaVersion}</schema-version>
                <short-name>${shortName}</short-name>
                <namespace>${namespace}</namespace>
                <json-base-uri>${jsonBaseUri}</json-base-uri>
            </METASCHEMA>`,
        );

        expect(metaschema.location).toBe(location);
        expect(metaschema.name.toString()).toBe(schemaName);
        expect(metaschema.version).toBe(schemaVersion);
        expect(metaschema.shortName).toBe(shortName);
        expect(metaschema.xmlNamespace).toBe(namespace);
        expect(metaschema.jsonBaseUri).toBe(jsonBaseUri);
    });

    /**
     * An import pattern of:
     * B─►I
     */
    it('should be able to import another metaschema', async () => {
        const resolver = mockResolverBuilder({
            'some.example/base.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Test</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>Longer</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
                <import href="some.example/imported.xml"/>
            </METASCHEMA>`,
            'some.example/imported.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Test2</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>Longer2</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
            </METASCHEMA>`,
        });

        const metaschema = await XmlMetaschema.load('some.example/base.xml', resolver);
        expect(metaschema.importedMetaschemas).toHaveLength(1);
        expect(metaschema.importedMetaschemas[0].name.toString()).toBe('Test2');
    });

    /**
     * An import pattern of:
     * ┌─┐
     * │ │
     * O◄┘
     */
    it('should fail on an import loop', async () => {
        const resolver = mockResolverBuilder({
            'some.example/ouroboros.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Test</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>Longer</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
                <import href="some.example/ouroboros.xml"/>
            </METASCHEMA>`,
        });

        // Weird syntax for async exceptions
        await expect(async () => await XmlMetaschema.load('some.example/ouroboros.xml', resolver)).rejects.toThrow();
    });

    /**
     * An import patten of:
     * ┌─T─┐
     * ▼   ▼
     * L   R
     * │   │
     * └►B◄┘
     */
    it('should handle an import diamond', async () => {
        const resolver = mockResolverBuilder({
            'some.example/top.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Top</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>top</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
                <import href="some.example/left.xml"/>
                <import href="some.example/right.xml"/>
            </METASCHEMA>`,
            'some.example/left.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Left</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>left</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
                <import href="some.example/bottom.xml"/>
            </METASCHEMA>`,
            'some.example/right.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Right</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>right</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
                <import href="some.example/bottom.xml"/>
            </METASCHEMA>`,
            'some.example/bottom.xml': `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <schema-name>Bottom</schema-name>
                <schema-version>Doesn't matter</schema-version>
                <short-name>bottom</short-name>
                <namespace>SpaceName</namespace>
                <json-base-uri>space-name</json-base-uri>
            </METASCHEMA>`,
        });

        const metaschema = await XmlMetaschema.load('some.example/top.xml', resolver);
        expect(metaschema.importedMetaschemas).toHaveLength(2);
        expect(metaschema.importedMetaschemas[0].importedMetaschemas).toHaveLength(1);
        expect(metaschema.importedMetaschemas[1].importedMetaschemas).toHaveLength(1);
        expect(metaschema.importedMetaschemas[0].importedMetaschemas[0].location).toBe('some.example/bottom.xml');
        expect(metaschema.importedMetaschemas[1].importedMetaschemas[0].location).toBe('some.example/bottom.xml');
    });
});

describe('XmlMetaschema.parseImports()', () => {
    [
        {
            name: 'should return nothing when no imports are present',
            raw: '<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0"></METASCHEMA>',
            expects: [],
        },
        {
            name: 'should return the correct url when one import is present',
            raw: `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <import href="https://some-test-url.example/fake_import.xml"/>
            </METASCHEMA>`,
            expects: ['https://some-test-url.example/fake_import.xml'],
        },
        {
            name: 'should return the correct urls when multiple imports are present',
            raw: `<METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
                <import href="https://some-test-url.example/fake_import.xml"/>
                <import href="https://some-test-url.example/fake_import2.xml"/>
            </METASCHEMA>`,
            expects: [
                'https://some-test-url.example/fake_import.xml',
                'https://some-test-url.example/fake_import2.xml',
            ],
        },
    ].map(({ name, raw, expects }) =>
        it(name, () => {
            const parsedXml = parseXml(raw);
            const parsedXmlMetaschema = parseObjectPropRequired('METASCHEMA', '*root*', parsedXml);
            const imports = XmlMetaschema['parseImports'](parsedXmlMetaschema);
            expect(imports).toStrictEqual(expects);
        }),
    );
});
