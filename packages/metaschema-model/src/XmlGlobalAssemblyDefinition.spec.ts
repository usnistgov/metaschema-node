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
import { ModelType } from '@oscal/metaschema-model-common/util';
import { placeholderMetaschema } from './testUtil/placeholders.js';
import XmlGlobalAssemblyDefinition from './XmlGlobalAssemblyDefinition.js';

describe('XmlGlobalAssemblyDefinition', () => {
    it('should load from XML', () => {
        const xml = parseXml(`
            <define-assembly xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0" name="parameter-selection">
                <formal-name>Selection</formal-name>
                <description>Presenting a choice among alternatives</description>
                <define-flag name="how-many" as-type="token">
                    <formal-name>Parameter Cardinality</formal-name>
                    <description>Describes the number of selections that must occur. Without this setting, only one value should be assumed to be permitted.</description>
                    <constraint>
                        <allowed-values allow-other="no">
                            <enum value="one">Only one value is permitted.</enum>
                            <enum value="one-or-more">One or more values are permitted.</enum>
                        </allowed-values>
                    </constraint>
                </define-flag>
                <model>
                    <define-field name="parameter-choice" as-type="markup-line" max-occurs="unbounded">
                        <formal-name>Choice</formal-name>
                        <description>A value selection among several such options</description>
                        <use-name>choice</use-name>
                        <json-value-key>value</json-value-key>
                        <!-- CHANGED "alternatives" to "choices" -->
                        <group-as name="choice" in-json="ARRAY"/>
                    </define-field>
                    <!-- <any/> -->
                </model>
                <remarks>
                    <p>A set of parameter value choices, that may be picked from to set the parameter value.</p>
                </remarks>
                <root-name>test-root</root-name>
            </define-assembly>
        `).documentElement;

        const assembly = new XmlGlobalAssemblyDefinition(xml, placeholderMetaschema);

        expect(assembly.getName()).toBe('parameter-selection');
        expect(assembly.getUseName()).toBe('parameter-selection');
        // TODO: test description
        // TODO: test remarks
        expect(assembly.getFieldInstances().get('choice')?.getDefinition().getFormalName()).toBe('Choice');

        expect(assembly.isRoot()).toBe(true);
        expect(assembly.getRootName()).toBe('test-root');
        expect(assembly.getRootJsonName()).toBe('test-root');
        expect(assembly.getRootXmlQName()?.toString()).toBe('SpaceName:test-root');

        expect(assembly.getModelType()).toBe(ModelType.ASSEMBLY);
    });
});
