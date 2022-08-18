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

import { processAttributes, processChildren, processElement } from './xmlProcessor.js';
import { forEachChild, parseXml, requireAttribute, requireOneChild } from './xmlProcessorUtil.js';

describe('processElement()', () => {
    const element = parseXml(`
        <?xml version="1.0" encoding="UTF-8"?>
        <DOCUMENT xmlns="http://test.example/fake-schema" someAttr="someValue">
            <a href="someLink.com">SomeBody</a>
        </DOCUMENT>`).documentElement;
    it('should process a basic XML document', () => {
        const result = processElement(
            element,
            {
                someAttr: requireAttribute((attr) => attr),
            },
            {
                a: forEachChild((child) => processElement(child, { href: requireAttribute((attr) => attr) }, {})),
            },
        );
        expect(result.attributes.someAttr).toBe('someValue');
        expect(result.children.a[0].body).toBe('SomeBody');
    });

    it('should handle namespaces', () => {
        const result = processElement(
            element,
            {
                someAttr: requireAttribute((attr) => attr),
            },
            {
                '{http://test.example/fake-schema}a': requireOneChild(
                    (child) => processElement(child, { href: requireAttribute((attr) => attr) }, {}).attributes.href,
                ),
            },
        );
        expect(result.attributes['someAttr']).toBe('someValue');
        expect(result.children['{http://test.example/fake-schema}a']).toBe('someLink.com');
    });

    it('should throw when throwErrorOnUnexpected is set as appropriate', () => {
        expect(() => processElement(element, {}, {}, true)).toThrow();
        expect(() =>
            processElement(
                element,
                {
                    someAttr: requireAttribute((attr) => attr),
                },
                {
                    '{http://test.example/fake-schema}a': forEachChild((child) => child),
                },
                true,
            ),
        ).not.toThrow();
    });
});

describe('processAttributes()', () => {
    it('should throw when processing an unexpected attribute & throwErrorOnUnexpected is set', () => {
        const element = parseXml(`<DOCUMENT unexpected="yep"></DOCUMENT>`).documentElement;
        expect(() => processAttributes(element, {}, true)).toThrow();
        expect(() => processAttributes(element, {})).not.toThrow();
        // should not throw when special attributes are set
        expect(() =>
            processAttributes(
                parseXml(`
                    <DOCUMENT
                        xmlns="https://test.example/schema"
                        xmlns:f="https://test.example/schema2"
                    ></DOCUMENT>`).documentElement,
                {},
                true,
            ),
        ).not.toThrow();
    });

    it('should pass null to an attribute processor when the attribute does not exist', () => {
        const result = processAttributes(parseXml(`<DOCUMENT existentAttr="true"></DOCUMENT>`).documentElement, {
            // return the attribute value verbatim
            nonExistentAttr: (attr) => attr,
            existentAttr: (attr) => attr,
        });
        expect(result.nonExistentAttr).toBeNull();
        expect(result.existentAttr).toBe('true');
    });

    it('should handle namespaced attributes', () => {
        const element = parseXml(`
            <DOCUMENT
                xmlns="https://test.example/schema"
                xmlns:f="https://test.example/schema2"
                test="testValue"
                f:test="testValue2"
            >
                <a test="1"/>
            </DOCUMENT>
        `).documentElement;
        const result = processAttributes(element, {
            test: (attr) => attr,
            '{https://test.example/schema2}test': (attr) => attr,
        });
        expect(result['test']).toBe('testValue');
        expect(result['{https://test.example/schema2}test']).toBe('testValue2');
    });
});

describe('processChildren()', () => {
    it('should throw when processing an unexpected child & throwErrorOnUnexpected is set', () => {
        const element = parseXml(`<DOCUMENT><unexpected/></DOCUMENT>`).documentElement;
        expect(() => processChildren(element, {}, true)).toThrow();
        expect(() => processChildren(element, {})).not.toThrow();
        // should not throw on an unexpected comment node
        expect(() => processChildren(parseXml(`<DOC><!--A comment--></DOC>`).documentElement, {}, true)).not.toThrow();
    });

    it('should properly extract text from an element', () => {
        expect(processChildren(parseXml(`<DOC></DOC>`).documentElement, {}).body).toBe('');
        expect(processChildren(parseXml(`<DOC><elem/></DOC>`).documentElement, {}).body).toBe('');
        expect(processChildren(parseXml(`<DOC>some text</DOC>`).documentElement, {}).body).toBe('some text');
        // all whitespace around the text is considered insignificant
        expect(
            processChildren(
                parseXml(`
                    <DOC>
                        some other text
                    </DOC>`).documentElement,
                {},
            ).body,
        ).toBe('some other text');
        // the text between the <b/> tags are not counted as part of the body for this mode of parsing
        expect(processChildren(parseXml(`<DOC>some <b>other</b> text</DOC>`).documentElement, {}).body).toBe(
            'some text',
        );
    });

    it('should handle namespaced children', () => {
        const element = parseXml(`
            <DOCUMENT
                xmlns="https://test.example/schema"
                xmlns:f="https://test.example/schema2"
            >
                <elemUnderDefaultNS>Elem Under Default NS Value</elemUnderDefaultNS>
                <f:elemUnderFNS>Elem Under F NS Value</f:elemUnderFNS>
            </DOCUMENT>
        `).documentElement;
        const result = processChildren(element, {
            '{https://test.example/schema}elemUnderDefaultNS': requireOneChild(
                (child) => processElement(child, {}, {}).body,
            ),
            '{https://test.example/schema2}elemUnderFNS': requireOneChild(
                (child) => processElement(child, {}, {}).body,
            ),
        });
        expect(result.children['{https://test.example/schema}elemUnderDefaultNS']).toBe('Elem Under Default NS Value');
        expect(result.children['{https://test.example/schema2}elemUnderFNS']).toBe('Elem Under F NS Value');
    });
});
