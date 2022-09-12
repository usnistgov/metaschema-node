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

import { JsonGroupAsBehavior, ModuleScope, XmlGroupAsBehavior } from '@oscal/metaschema-model-common/util';
import { placeholderContext } from '../testUtil/index.js';
import { processJsonGroupAsBehavior, processModuleScope, processXmlGroupAsBehavior } from './enums.js';

describe('enums', () => {
    it('processModuleScope()', () => {
        expect(processModuleScope('local', placeholderContext)).toBe(ModuleScope.LOCAL);
        expect(processModuleScope('inherited', placeholderContext)).toBe(ModuleScope.INHERITED);
        expect(processModuleScope(null, placeholderContext)).toBe(ModuleScope.INHERITED);
        expect(() => processModuleScope('invalid', placeholderContext)).toThrow();
    });

    it('processXmlGroupAsBehavior()', () => {
        expect(processXmlGroupAsBehavior('WITH_WRAPPER', placeholderContext)).toBe(XmlGroupAsBehavior.GROUPED);
        expect(processXmlGroupAsBehavior('UNWRAPPED', placeholderContext)).toBe(XmlGroupAsBehavior.UNGROUPED);
        expect(() => processXmlGroupAsBehavior(null, placeholderContext)).toThrow();
        expect(() => processXmlGroupAsBehavior('invalid', placeholderContext)).toThrow();
    });

    it('processJsonGroupAsBehavior()', () => {
        expect(processJsonGroupAsBehavior('ARRAY', placeholderContext)).toBe(JsonGroupAsBehavior.LIST);
        expect(processJsonGroupAsBehavior('SINGLETON_OR_ARRAY', placeholderContext)).toBe(
            JsonGroupAsBehavior.SINGLETON_OR_LIST,
        );
        expect(processJsonGroupAsBehavior('BY_KEY', placeholderContext)).toBe(JsonGroupAsBehavior.KEYED);
        expect(() => processJsonGroupAsBehavior(null, placeholderContext)).toThrow();
        expect(() => processJsonGroupAsBehavior('invalid', placeholderContext)).toThrow();
    });
});
