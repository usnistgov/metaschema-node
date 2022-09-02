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

import { parseXml } from '@oscal/data-utils';
import { ModelType, ModuleScope } from '@oscal/metaschema-model-common/util';
import { placeholderMetaschema } from './testUtil/index.js';
import XmlGlobalFieldDefinition from './XmlGlobalFieldDefinition.js';

describe('XmlGlobalFlagDefinition', () => {
    it('should load from XML', () => {
        const xml = parseXml(`
            <define-field xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" name="threat-id" as-type="uri">
                <!-- This is an id because it is an externally provided identifier -->
                <formal-name>Threat ID</formal-name>
                <description>A pointer, by ID, to an externally-defined threat.</description>
                <json-value-key>id</json-value-key>
                <define-flag name="system" as-type="uri" required="yes">
                    <formal-name>Threat Type Identification System</formal-name>
                    <description>Specifies the source of the threat information.</description>
                    <constraint>
                        <allowed-values allow-other="yes">
                            <enum value="http://fedramp.gov" deprecated="1.0.3">**deprecated** The value conforms to FedRAMP definitions. This value has been deprecated; use <code>http://fedramp.gov/ns/oscal</code> instead.</enum>
                            <enum value="http://fedramp.gov/ns/oscal">The value conforms to FedRAMP definitions.</enum>
                        </allowed-values>
                    </constraint>
                </define-flag>
                <define-flag name="href" as-type="uri-reference">
                    <formal-name>Threat Information Resource Reference</formal-name>
                    <description>An optional location for the threat data, from which this ID originates.</description>
                </define-flag>
            </define-field>
        `).documentElement;

        const field = new XmlGlobalFieldDefinition(xml, placeholderMetaschema);

        expect(field.getName()).toBe('threat-id');
        expect(field.getUseName()).toBe('threat-id');
        // TODO: test datatype
        expect(field.getModuleScope()).toBe(ModuleScope.INHERITED);
        expect(field.getJsonValueKey()).toBe('id');
        expect(field.getFormalName()).toBe('Threat ID');
        // TODO: test description
        // TODO: test remarks
        expect(field.getConstraints()).toHaveLength(0); // no constraints were defined

        // Set by default
        expect(field.isCollapsible()).toBe(true);

        expect(field.getInlineInstance()).toBe(undefined);
        expect(field.isInline()).toBe(false);
        expect(field.getContainingMetaschema()).toBe(placeholderMetaschema);

        const flags = field.getFlagInstances();

        expect(flags.get('system')?.getContainingMetaschema()).toBe(placeholderMetaschema);
        expect(flags.get('system')?.getDefinition().getConstraints()).toHaveLength(1);
        // expect target default on flag constraint
        expect(flags.get('system')?.getDefinition().getConstraints()[0].target.toString()).toBe('.');

        expect(flags.get('href')?.getDefinition().getName()).toBe('href');

        expect(field.isSimple()).toBe(false);

        expect(field.getModelType()).toBe(ModelType.FIELD);
    });
});
