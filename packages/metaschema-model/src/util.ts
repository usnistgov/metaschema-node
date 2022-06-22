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

// lifted from OSCAL-deep-diff, may need to be narrowed or expanded if fast-xml-parser does something interesting
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JSONArray extends Array<JSONValue> {}

function tryGetProp(propName: string, parentName: string, obj: JSONObject): JSONValue {
    if (!(propName in obj)) {
        throw new Error(`'${propName}' does not exist in parent ${parentName}`);
    }
    return obj[propName];
}

export function parseStringProp(propName: string, parentName: string, obj: JSONObject): string {
    let value = tryGetProp(propName, parentName, obj);
    if (Number.isInteger(value)) {
        // issue specific to version numbers
        // TODO: figure out a more elegant solution here
        value = value + '.0';
    }
    if (typeof value !== 'string') {
        throw new Error(`${propName} in parent ${parentName} is not of string type`);
    }
    return value;
}

export function parseObjectProp(propName: string, parentName: string, obj: JSONObject): JSONObject {
    const value = tryGetProp(propName, parentName, obj);
    if (!(value && typeof value === 'object' && !Array.isArray(value))) {
        throw new Error(`${propName} in parent ${parentName} is not of object type`);
    }
    return value;
}

export function parseArrayProp(propName: string, parentName: string, obj: JSONObject): JSONArray {
    const value = tryGetProp(propName, parentName, obj);
    if (!Array.isArray(value)) {
        throw new Error(`${propName} in parent ${parentName} is not of array type`);
    }
    return value;
}

export function parseArrayOrObjectProp(propName: string, parentName: string, obj: JSONObject): JSONArray {
    let value = tryGetProp(propName, parentName, obj);
    if (!(value && typeof value === 'object')) {
        throw new Error(`${propName} in parent ${parentName} is not of array or object type`);
    }

    if (!Array.isArray(value)) {
        value = [value];
    }

    return value;
}
