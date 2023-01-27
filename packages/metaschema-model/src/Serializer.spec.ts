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

import { AbstractAtomicItem, DocumentItemSerializer, FlagItem } from '@oscal/metaschema-model-common/datatype';
import XmlMetaschema from './XmlMetaschema.js';

describe('Serializer', () => {
    it('should load a document instance', async () => {
        const metaschema = await XmlMetaschema.load(
            'file://not-real.xml',
            // fake the resolver to always return our target xml
            async (_) => `<?xml version="1.0" encoding="UTF-8"?>
            <METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
              <schema-name>Computer Model</schema-name>
              <schema-version>0.0.2</schema-version>
              <short-name>computer</short-name>
              <namespace>http://example.com/ns/computer</namespace>
              <json-base-uri>http://example.com/ns/computer</json-base-uri>
              <define-assembly name="computer">
                <formal-name>Computer Assembly</formal-name>
                <description>A container object for a computer, its parts, and its sub-parts.</description>
                <root-name>computer</root-name>
                <define-flag name="id" as-type="string" required="yes">
                    <formal-name>Computer Identifier</formal-name>
                    <description>An identifier for classifying a unique make and model of computer.</description>
                </define-flag>
                <model>
                </model>
              </define-assembly>
            </METASCHEMA>`,
        );

        const documentItemSerializer = new DocumentItemSerializer<
            Record<string, never>,
            // TODO: redundant FlagItem wrapper, this is wrong!
            { id: FlagItem<AbstractAtomicItem<string>> }
        >(metaschema, 'file://not-real.xml');
        const serialized = documentItemSerializer.readJson({
            computer: {
                id: 'computer1',
            },
        });

        expect(serialized.value.value.flags.id.value.value).toBe('computer1');
    });
});
