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

import { StringItem } from '../../metapath/index.js';
import StringAdapter from './StringAdapter.js';

describe('StringAdapter', () => {
    const adapter = new StringAdapter();
    it('should unmarshal JSON', () => {
        const raw = JSON.parse('"Raw JSON string"');
        expect(adapter.readJson(raw).value).toBe('Raw JSON string');
    });

    it('should fail to unmarshal invalid JSON objects', () => {
        const raw = JSON.parse('{ "test": "123" }');
        expect(() => adapter.readJson(raw)).toThrow();
    });

    it('should marshal JSON', () => {
        const item = new StringItem('stored string item');
        expect(adapter.writeJson(item)).toBe('stored string item');
    });

    // TODO: this fails due to a lack of Document implementations in Node
    // it('should marshal XML', () => {
    //     const item = new StringItem('stored string item');
    //     const document = new Document();
    //     const node = adapter.writeXml(item, document);
    //     expect(node.textContent).toBe('stored string item');
    // });
});
