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
    CardinalityConstraint,
    ExpectConstraint,
    IndexHasConstraint,
    IKeyField,
    IndexConstraint,
    UniqueConstraint,
} from '@oscal/metaschema-model-common/constraint';
import { MetapathExpression } from '@oscal/metaschema-model-common/metapath';
import { Level } from '@oscal/metaschema-model-common/util';
import XMLParsingError, {
    JSONObject,
    JSONValue,
    parseArrayOrObjectPropRequired,
    parseMarkupMultiLine,
    parseNumberProp,
    parseStringProp,
    parseStringPropRequired,
} from './parseUtil.js';

function parseLevel(propName: string, parentName: string, parent: JSONValue): Level {
    const raw = parseStringProp(propName, parentName, parent);
    if (raw === undefined) {
        return Level.ERROR;
    }

    let level: Level;
    switch (raw) {
        case 'INFORMATIONAL':
            level = Level.INFORMATIONAL;
            break;
        case 'WARNING':
            level = Level.WARNING;
            break;
        case 'ERROR':
            level = Level.ERROR;
            break;
        case 'CRITICAL':
            level = Level.CRITICAL;
            break;
        default:
            throw new XMLParsingError(`Unknown level ${raw} in parent ${parentName}`);
    }

    return level;
}

function parseMetapath(propName: string, parentName: string, parent: JSONValue): MetapathExpression | undefined {
    const raw = parseStringProp(propName, parentName, parent);
    if (raw === undefined) {
        return undefined;
    }
    return new MetapathExpression(raw);
}

function parseMetapathRequired(propName: string, parentName: string, parent: JSONValue): MetapathExpression {
    const value = parseMetapath(propName, parentName, parent);
    if (value === undefined) {
        throw XMLParsingError.undefined(propName, parentName);
    }
    return value;
}

function parseKeyFields(propName: string, parentName: string, parent: JSONValue): IKeyField[] {
    const raw = parseArrayOrObjectPropRequired(propName, parentName, parent);
    return raw.map((parsedKeyField) => {
        const rawPattern = parseStringProp('@_pattern', 'key-field', parsedKeyField);
        return {
            pattern: rawPattern ? new RegExp(rawPattern) : undefined,
            remarks: parseMarkupMultiLine('remarks', 'expect', parsedKeyField),
            target: parseStringPropRequired('@_target', 'expect', parsedKeyField),
        };
    });
}

export function loadCardinalityConstraint(parsedXml: JSONObject): CardinalityConstraint {
    return new CardinalityConstraint(
        parseStringProp('@_id', 'has-cardinality', parsedXml),
        parseLevel('@_level', 'has-cardinality', parsedXml),
        parseMarkupMultiLine('remarks', 'has-cardinality', parsedXml),
        parseMetapathRequired('@_target', 'has-cardinality', parsedXml),
        parseNumberProp('@_min-occurs', 'has-cardinality', parsedXml),
        parseNumberProp('@_max-occurs', 'has-cardinality', parsedXml),
    );
}

export function loadExpectsConstraint(parsedXml: JSONObject) {
    return new ExpectConstraint(
        parseStringProp('@_id', 'expect', parsedXml),
        parseLevel('@_level', 'expect', parsedXml),
        parseMarkupMultiLine('remarks', 'expect', parsedXml),
        parseMetapathRequired('@_target', 'expect', parsedXml),
        parseMetapathRequired('@_test', 'expect', parsedXml),
        parseStringPropRequired('message', 'expect', parsedXml),
    );
}

export function loadIndexHasConstraint(parsedXml: JSONObject) {
    return new IndexHasConstraint(
        parseStringProp('@_id', 'index-has', parsedXml),
        parseLevel('@_level', 'index-has', parsedXml),
        parseMarkupMultiLine('remarks', 'index-has', parsedXml),
        parseMetapathRequired('@_target', 'index-has', parsedXml),
        parseKeyFields('key-fields', 'index-has', parsedXml),
        parseStringPropRequired('@_name', 'index-has', parsedXml),
    );
}

export function loadIndexConstraint(parsedXml: JSONObject) {
    return new IndexConstraint(
        parseStringProp('@_id', 'index', parsedXml),
        parseLevel('@_level', 'index', parsedXml),
        parseMarkupMultiLine('remarks', 'index', parsedXml),
        parseMetapathRequired('@_target', 'index', parsedXml),
        parseKeyFields('key-fields', 'index', parsedXml),
        parseStringPropRequired('@_name', 'index', parsedXml),
    );
}

export function loadUniqueConstraint(parsedXml: JSONObject) {
    return new UniqueConstraint(
        parseStringProp('@_id', 'is-unique', parsedXml),
        parseLevel('@_level', 'is-unique', parsedXml),
        parseMarkupMultiLine('remarks', 'is-unique', parsedXml),
        parseMetapathRequired('@_target', 'is-unique', parsedXml),
        parseKeyFields('key-fields', 'is-unique', parsedXml),
    );
}

// export function loadMatchesConstraint(parsedXml: JSONObject) {
//     const id = parseStringProp('@_id', 'matches', parsedXml);
//     const rawLevel = parseStringProp('@_level', 'matches', parsedXml);
//     const target = parseStringPropRequired('@_target', 'matches', parsedXml);
//     const rawPattern = parseStringPropRequired('@_pattern', 'matches', parsedXml);
//     const datatype = parseStringPropRequired('@_datatype', 'matches', parsedXml);

//     return new MatchesConstraint(
//         id,
//         parseLevel(rawLevel),
//         undefined,
//         parseTarget(target),
//         new RegExp(rawPattern),
//         undefined,
//     );
// }

// export function loadAllowedValues(parsedXml: JSONObject) {

//     return new AllowedValuesConstraint()
// }
