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

import { processElement } from './xmlProcessor.js';
import {
    optionalOneChild,
    parseXml,
    processBooleanAttribute,
    processNumberAttribute,
    requireAttribute,
    requireOneChild,
    undefineableAttribute,
} from './xmlProcessorUtil.js';

describe('requireAttribute()', () => {
    it('should fail if required attribute is missing', () => {
        expect(() =>
            processElement(
                parseXml('<DOC></DOC>').documentElement,
                {
                    required: requireAttribute((attr) => attr),
                },
                {},
            ),
        ).toThrow();
        expect(() =>
            processElement(
                parseXml('<DOC required="true"></DOC>').documentElement,
                {
                    required: requireAttribute((attr) => attr),
                },
                {},
            ),
        ).not.toThrow();
    });
});

describe('undefineableAttribute()', () => {
    it("shouldn't call attribute processor if required attribute is missing", () => {
        let sideEffectCalled = false;
        processElement(
            parseXml('<DOC></DOC>').documentElement,
            {
                required: undefineableAttribute((attr) => {
                    sideEffectCalled = true;
                    return attr;
                }),
            },
            {},
        );
        expect(sideEffectCalled).toBe(false);

        processElement(
            parseXml('<DOC required="true"></DOC>').documentElement,
            {
                required: undefineableAttribute((attr) => {
                    sideEffectCalled = true;
                    return attr;
                }),
            },
            {},
        );
        expect(sideEffectCalled).toBe(true);
    });
});

describe('optionalOneChild()', () => {
    it('should throw with more then one child', () => {
        expect(() =>
            processElement(
                parseXml('<DOC><a/><a/><a/></DOC>').documentElement,
                {},
                {
                    a: optionalOneChild((child) => child),
                },
            ),
        ).toThrow();

        expect(() =>
            processElement(
                parseXml('<DOC><a/></DOC>').documentElement,
                {},
                {
                    a: optionalOneChild((child) => child),
                },
            ),
        ).not.toThrow();
    });

    it('should return undefined if child does not exist', () => {
        expect(
            processElement(
                parseXml('<DOC></DOC>').documentElement,
                {},
                {
                    a: optionalOneChild((child) => child),
                },
            ).children.a,
        ).toBe(undefined);
    });
});

describe('requireOneChild()', () => {
    it('should throw with more then one child', () => {
        expect(() =>
            processElement(
                parseXml('<DOC><a/><a/><a/></DOC>').documentElement,
                {},
                {
                    a: requireOneChild((child) => child),
                },
            ),
        ).toThrow();

        expect(() =>
            processElement(
                parseXml('<DOC><a/></DOC>').documentElement,
                {},
                {
                    a: requireOneChild((child) => child),
                },
            ),
        ).not.toThrow();
    });

    it('should return undefined if child does not exist', () => {
        expect(() =>
            processElement(
                parseXml('<DOC></DOC>').documentElement,
                {},
                {
                    a: requireOneChild((child) => child),
                },
            ),
        ).toThrow();
    });
});

describe('processBooleanAttribute()', () => {
    it('should process boolean values correctly', () => {
        expect(
            processElement(
                parseXml('<DOC bool="true"></DOC>').documentElement,
                {
                    bool: requireAttribute(processBooleanAttribute),
                },
                {},
            ).attributes.bool,
        ).toBe(true);

        expect(
            processElement(
                parseXml('<DOC bool="false"></DOC>').documentElement,
                {
                    bool: requireAttribute(processBooleanAttribute),
                },
                {},
            ).attributes.bool,
        ).toBe(false);
    });

    it('should fail if an invalid value is provided', () => {
        expect(() =>
            processElement(
                parseXml('<DOC bool="hello"></DOC>').documentElement,
                {
                    bool: requireAttribute(processBooleanAttribute),
                },
                {},
            ),
        ).toThrow();
    });
});

describe('processNumberAttribute()', () => {
    it('should process number values correctly', () => {
        expect(
            processElement(
                parseXml('<DOC bool="42"></DOC>').documentElement,
                {
                    bool: requireAttribute(processNumberAttribute),
                },
                {},
            ).attributes.bool,
        ).toBe(42);
    });

    it('should fail if an invalid value is provided', () => {
        expect(() =>
            processElement(
                parseXml('<DOC bool="hello"></DOC>').documentElement,
                {
                    bool: requireAttribute(processNumberAttribute),
                },
                {},
            ),
        ).toThrow();
    });
});
