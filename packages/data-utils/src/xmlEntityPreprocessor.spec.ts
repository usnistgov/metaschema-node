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

import { extractEntities } from './xmlEntityPreprocessor.js';

describe('extractEntities()', () => {
    it('should extract entities out of the test document', () => {
        const entities = extractEntities(`
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE METASCHEMA [
                <!ENTITY allowed-values-responsible-roles-operations SYSTEM "./shared-constraints/allowed-values-responsible-roles-operations.ent">
                <!ENTITY allowed-values-responsible-roles-component-production SYSTEM "./shared-constraints/allowed-values-responsible-roles-component-production.ent">
                <!ENTITY allowed-values-property-name-asset-type-values SYSTEM "./shared-constraints/allowed-values-property-name-asset-type-values.ent">
                <!ENTITY allowed-values-component_component_property-name SYSTEM "./shared-constraints/allowed-values-component_component_property-name.ent">
                <!ENTITY allowed-values-component_component_software SYSTEM "./shared-constraints/allowed-values-component_component_software.ent">
                <!ENTITY allowed-values-component_component_service SYSTEM "./shared-constraints/allowed-values-component_component_service.ent">
                <!ENTITY allowed-values-component_inventory-item_property-name SYSTEM "./shared-constraints/allowed-values-component_inventory-item_property-name.ent">
                <!ENTITY allowed-values-component_component_link-rel SYSTEM "./shared-constraints/allowed-values-component_component_link-rel.ent">
                <!ENTITY allowed-values-component-type SYSTEM "./shared-constraints/allowed-values-component-type.ent">
            ]>
            <METASCHEMA xmlns="http://csrc.nist.gov/ns/oscal/metaschema/1.0">
        
            </METASCHEMA>
        `);
        expect(Object.entries(entities)).toHaveLength(9);

        expect(entities['allowed-values-responsible-roles-operations']).toBe(
            './shared-constraints/allowed-values-responsible-roles-operations.ent',
        );
    });
});
