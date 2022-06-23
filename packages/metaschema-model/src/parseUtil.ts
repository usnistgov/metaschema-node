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

import { MarkupLine, MarkupMultiLine } from '@oscal/metaschema-model-common/datatype';
import { XMLParser } from 'fast-xml-parser';

// lifted from OSCAL-deep-diff, may need to be narrowed or expanded if fast-xml-parser does something interesting
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JSONArray extends Array<JSONValue> {}

export function parseXml(raw: string | Buffer): JSONObject {
    const parser = new XMLParser({ ignoreAttributes: false });
    return parser.parse(raw);
}

export default class XMLParsingError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, XMLParsingError.prototype);
    }

    static undefined(propName: string, parentName: string) {
        return new XMLParsingError(`${propName} does not exist in parent ${parentName}`);
    }

    static wrongType(propName: string, parentName: string, type: string) {
        return new XMLParsingError(`${propName} in parent ${parentName} is not of ${type} type`);
    }
}

/**
 * Attempt to convert a JSONValue to an object, throw an error if unsuccessful
 */
export function tryConvertToObject(name: string, parent: JSONValue): JSONObject {
    if (!(parent && typeof parent === 'object' && !Array.isArray(parent))) {
        throw new XMLParsingError(`${name} could not be used as type object`);
    }
    return parent;
}

export function parseNumberProp(propName: string, parentName: string, parent: JSONValue): number | undefined {
    parent = tryConvertToObject(parentName, parent);
    if (!(propName in parent)) {
        return undefined;
    }
    let value = parent[propName];
    if (typeof value !== 'number') {
        if (typeof value === 'string') {
            value = Number(value);
            if (!Number.isNaN(value)) {
                return value;
            }
        }
        throw XMLParsingError.wrongType(propName, parentName, 'number');
    }
    return value;
}

export function parseNumberPropRequired(propName: string, parentName: string, parent: JSONValue): number {
    const value = parseNumberProp(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

export function parseStringProp(propName: string, parentName: string, parent: JSONValue): string | undefined {
    parent = tryConvertToObject(parentName, parent);
    if (!(propName in parent)) {
        return undefined;
    }
    let value = parent[propName];
    if (Number.isInteger(value)) {
        // issue specific to version numbers
        // TODO: figure out a more elegant solution here
        value = value + '.0';
    }
    if (typeof value !== 'string') {
        throw XMLParsingError.wrongType(propName, parentName, 'string');
    }
    return value;
}

export function parseStringPropRequired(propName: string, parentName: string, parent: JSONValue): string {
    const value = parseStringProp(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

export function parseObjectProp(propName: string, parentName: string, parent: JSONValue): JSONObject | undefined {
    parent = tryConvertToObject(parentName, parent);
    if (!(propName in parent)) {
        return undefined;
    }
    const value = parent[propName];
    if (!(value && typeof value === 'object' && !Array.isArray(value))) {
        throw XMLParsingError.wrongType(propName, parentName, 'object');
    }
    return value;
}

export function parseObjectPropRequired(propName: string, parentName: string, parent: JSONValue): JSONObject {
    const value = parseObjectProp(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

export function parseArrayProp(propName: string, parentName: string, parent: JSONValue): JSONArray | undefined {
    parent = tryConvertToObject(parentName, parent);
    if (!(propName in parent)) {
        return undefined;
    }
    const value = parent[propName];
    if (!Array.isArray(value)) {
        throw XMLParsingError.wrongType(propName, parentName, 'array');
    }
    return value;
}

export function parseArrayPropRequired(propName: string, parentName: string, parent: JSONValue): JSONArray {
    const value = parseArrayProp(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

export function parseArrayOrObjectProp(propName: string, parentName: string, parent: JSONValue): JSONArray | undefined {
    parent = tryConvertToObject(parentName, parent);
    if (!(propName in parent)) {
        return undefined;
    }
    let value = parent[propName];
    if (!(value && typeof value === 'object')) {
        throw XMLParsingError.wrongType(propName, parentName, 'array or object');
    }

    if (!Array.isArray(value)) {
        value = [value];
    }

    return value;
}

export function parseArrayOrObjectPropRequired(propName: string, parentName: string, parent: JSONValue): JSONArray {
    const value = parseArrayOrObjectProp(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

export function parseMarkupLine(propName: string, parentName: string, parent: JSONValue): MarkupLine | undefined {
    // TODO: implement correctly as MarkupLine is implemented.
    const value = parseStringProp(propName, parentName, parent);
    if (value) {
        return new MarkupLine(value);
    }
    return undefined;
}

/**
 * TODO replace with working implementation
 */
export function parseMarkupLineRequired(propName: string, parentName: string, parent: JSONValue): MarkupLine {
    const value = parseMarkupLine(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

/**
 * TODO replace with working implementation
 */
export function parseMarkupMultiLine(
    _propName: string,
    _parentName: string,
    _parent: JSONValue,
): MarkupMultiLine | undefined {
    return new MarkupMultiLine();
}
