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

import {
    parseArrayOrObjectProp,
    parseArrayOrObjectPropRequired,
    parseArrayProp,
    parseArrayPropRequired,
    parseMarkupLine,
    parseMarkupLineRequired,
    parseNumberProp,
    parseNumberPropRequired,
    parseObjectProp,
    parseObjectPropRequired,
    parseStringProp,
    parseStringPropRequired,
    tryConvertToObject,
} from './parseUtil.js';

describe('tryConvertToObject()', () => {
    it('should throw on non-JSONObject type passed in', () => {
        expect(() => tryConvertToObject('test', 'not an object')).toThrow();
    });
});

describe('parseNumberProp()', () => {
    it('should handle numeric types', () => {
        expect(parseNumberProp('num', '*root*', { num: 42 })).toBe(42);
    });
    it('should handle number strings', () => {
        expect(parseNumberProp('num', '*root*', { num: '42' })).toBe(42);
    });
    it('should return undefined when not exist', () => {
        expect(parseNumberProp('num', '*root*', {})).toBe(undefined);
    });
    it('should throw error on non-numeric string', () => {
        expect(() => parseNumberProp('num', '*root*', { num: 'something' })).toThrow();
    });
    it('should throw error on boolean (or other coercible number types)', () => {
        expect(() => parseNumberProp('num', '*root*', { num: true })).toThrow();
    });
});

describe('parseNumberPropRequired()', () => {
    it('should handle numeric types', () => {
        expect(parseNumberPropRequired('num', '*root*', { num: 42 })).toBe(42);
    });
    it('should throw error when not exist', () => {
        expect(() => parseNumberPropRequired('num', '*root*', {})).toThrow();
    });
});

describe('parseStringProp()', () => {
    it('should handle string types', () => {
        expect(parseStringProp('str', '*root*', { str: '42' })).toBe('42');
    });
    it('should return undefined when not exist', () => {
        expect(parseStringProp('str', '*root*', {})).toBe(undefined);
    });
    it('should throw error on non-string type', () => {
        expect(() => parseStringProp('str', '*root*', { str: false })).toThrow();
        expect(() => parseStringProp('str', '*root*', { str: {} })).toThrow();
        expect(() => parseStringProp('str', '*root*', { str: [] })).toThrow();
    });
});

describe('parseStringPropRequired()', () => {
    it('should handle string types', () => {
        expect(parseStringPropRequired('str', '*root*', { str: '42' })).toBe('42');
    });
    it('should throw error when not exist', () => {
        expect(() => parseStringPropRequired('num', '*root*', {})).toThrow();
    });
});

describe('parseObjectProp()', () => {
    it('should handle object types', () => {
        expect(parseObjectProp('obj', '*root*', { obj: { a: 1 } })).toStrictEqual({ a: 1 });
    });
    it('should return undefined when not exist', () => {
        expect(parseNumberProp('obj', '*root*', {})).toBe(undefined);
    });
    it('should throw error on non-object type', () => {
        expect(() => parseObjectProp('obj', '*root*', { obj: false })).toThrow();
        expect(() => parseObjectProp('obj', '*root*', { obj: 'help' })).toThrow();
        expect(() => parseObjectProp('obj', '*root*', { obj: 55 })).toThrow();
        expect(() => parseObjectProp('obj', '*root*', { obj: [] })).toThrow();
    });
});

describe('parseObjectPropRequired()', () => {
    it('should throw error when not exist', () => {
        expect(() => parseObjectPropRequired('num', '*root*', {})).toThrow();
    });
});

describe('parseArrayProp()', () => {
    it('should handle array types', () => {
        expect(parseArrayProp('arr', '*root*', { arr: [1, 2] })).toStrictEqual([1, 2]);
    });
    it('should return undefined when not exist', () => {
        expect(parseArrayProp('arr', '*root*', {})).toBe(undefined);
    });
    it('should throw error on non-object type', () => {
        expect(() => parseArrayProp('arr', '*root*', { arr: false })).toThrow();
        expect(() => parseArrayProp('arr', '*root*', { arr: '' })).toThrow();
        expect(() => parseArrayProp('arr', '*root*', { arr: 55 })).toThrow();
        expect(() => parseArrayProp('arr', '*root*', { arr: {} })).toThrow();
    });
});

describe('parseArrayPropRequired()', () => {
    it('should handle array types', () => {
        expect(parseArrayPropRequired('arr', '*root*', { arr: [1, 2] })).toStrictEqual([1, 2]);
    });
    it('should throw error when not exist', () => {
        expect(() => parseArrayPropRequired('num', '*root*', {})).toThrow();
    });
});

describe('parseArrayOrObjectProp()', () => {
    it('should handle array types', () => {
        expect(parseArrayOrObjectProp('arr', '*root*', { arr: [1, 2] })).toStrictEqual([1, 2]);
    });
    it('should handle object types', () => {
        expect(parseArrayOrObjectProp('obj', '*root*', { obj: { a: 1 } })).toStrictEqual([{ a: 1 }]);
    });
    it('should return undefined when not exist', () => {
        expect(parseArrayOrObjectProp('arr', '*root*', {})).toBe(undefined);
    });
    it('should throw error on non-array-or-object type', () => {
        expect(() => parseArrayOrObjectProp('arr', '*root*', { arr: false })).toThrow();
        expect(() => parseArrayOrObjectProp('arr', '*root*', { arr: '' })).toThrow();
        expect(() => parseArrayOrObjectProp('arr', '*root*', { arr: 55 })).toThrow();
    });
});

describe('parseArrayOrObjectPropRequired()', () => {
    it('should handle array types', () => {
        expect(parseArrayOrObjectPropRequired('arr', '*root*', { arr: [1, 2] })).toStrictEqual([1, 2]);
    });
    it('should handle object types', () => {
        expect(parseArrayOrObjectPropRequired('obj', '*root*', { obj: { a: 1 } })).toStrictEqual([{ a: 1 }]);
    });
    it('should throw error when not exist', () => {
        expect(() => parseArrayOrObjectPropRequired('num', '*root*', {})).toThrow();
    });
});

describe('parseMarkupLine()', () => {
    it('should return undefined when not exist', () => {
        expect(parseMarkupLine('test', '*root*', {})).toBe(undefined);
    });
});

describe('parseMarkupLineRequired()', () => {
    it('should throw error when not exist', () => {
        expect(() => parseMarkupLineRequired('test', '*root*', {})).toThrow();
    });
});
