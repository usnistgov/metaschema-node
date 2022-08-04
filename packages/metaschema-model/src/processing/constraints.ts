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
    MatchesConstraint,
    AllowedValuesConstraint,
    IAllowedValue,
} from '@oscal/metaschema-model-common/constraint';
import { MetapathExpression } from '@oscal/metaschema-model-common/metapath';
import { Level } from '@oscal/metaschema-model-common/util';
import {
    AttributeProcessor,
    ChildProcessor,
    DefiniteAttributeProcessor,
    forEachChild,
    optionalOneChild,
    processBooleanAttribute,
    processElement,
    processNumberAttribute,
    requireAttribute,
    requireOneChild,
    undefineableAttribute,
    XmlProcessingError,
} from '@oscal/data-utils';
import { processMarkupLine, processMarkupMultiLine } from './markup.js';
import { processDatatypeAdapter } from './datatype.js';

const processLevel: AttributeProcessor<Level> = (attribute, context) => {
    if (attribute === null) {
        return Level.ERROR;
    }

    let level: Level;
    switch (attribute) {
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
            throw XmlProcessingError.withContext(context, `Invalid level "${attribute}"`);
    }

    return level;
};

const processMetapath: DefiniteAttributeProcessor<MetapathExpression> = (attribute, _context) => {
    return new MetapathExpression(attribute);
};

type ConstraintsOutput = {
    cardinalityConstraints: CardinalityConstraint[];
    expectConstraints: ExpectConstraint[];
    indexConstraints: IndexConstraint[];
    indexHasConstraints: IndexHasConstraint[];
    uniqueConstraints: UniqueConstraint[];
    matchesConstraints: MatchesConstraint[];
    allowedValuesConstraints: AllowedValuesConstraint[];
};

export const processConstraints: ChildProcessor<ConstraintsOutput> = (child, _context) => {
    const processed = processElement(
        child,
        {},
        {
            'has-cardinality': forEachChild(processCardinalityConstraint),
            expect: forEachChild(processExpectConstraint),
            'index-has-key': forEachChild(processIndexHasConstraint),
            index: forEachChild(processIndexConstraint),
            'is-unique': forEachChild(processUniqueConstraint),
            matches: forEachChild(processMatchesConstraint),
            'allowed-values': forEachChild(processAllowedValuesConstraint),
        },
    );
    return {
        cardinalityConstraints: processed.children['has-cardinality'],
        expectConstraints: processed.children.expect,
        indexHasConstraints: processed.children['index-has-key'],
        indexConstraints: processed.children.index,
        uniqueConstraints: processed.children['is-unique'],
        matchesConstraints: processed.children.matches,
        allowedValuesConstraints: processed.children['allowed-values'],
    };
};

const CONSTRAINT_COMMON_ATTRS = {
    id: undefineableAttribute((attr) => attr),
    level: processLevel,
    target: requireAttribute(processMetapath),
};

const CONSTRAINT_COMMON_CHILDREN = {
    remarks: optionalOneChild(processMarkupMultiLine),
};

const processCardinalityConstraint: ChildProcessor<CardinalityConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        {
            ...CONSTRAINT_COMMON_ATTRS,
            'min-occurs': undefineableAttribute(processNumberAttribute),
            'max-occurs': undefineableAttribute(processNumberAttribute),
        },
        CONSTRAINT_COMMON_CHILDREN,
    );
    return new CardinalityConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.attributes['min-occurs'],
        processed.attributes['max-occurs'],
    );
};

const processExpectConstraint: ChildProcessor<ExpectConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        { ...CONSTRAINT_COMMON_ATTRS, test: requireAttribute(processMetapath) },
        { ...CONSTRAINT_COMMON_CHILDREN, message: requireOneChild((child) => processElement(child, {}, {}).body) },
    );
    return new ExpectConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.attributes.test,
        processed.children.message,
    );
};

const processKeyFields: ChildProcessor<IKeyField> = (child, _context) => {
    const processed = processElement(
        child,
        {
            pattern: undefineableAttribute((attribute) => new RegExp(attribute)),
            target: requireAttribute(processMetapath),
        },
        CONSTRAINT_COMMON_CHILDREN,
    );
    return {
        pattern: processed.attributes.pattern,
        remarks: processed.children.remarks,
        target: processed.attributes.target,
    };
};

const processIndexHasConstraint: ChildProcessor<IndexHasConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        { ...CONSTRAINT_COMMON_ATTRS, name: requireAttribute((attr) => attr) },
        { ...CONSTRAINT_COMMON_CHILDREN, 'key-fields': forEachChild(processKeyFields) },
    );
    return new IndexHasConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.children['key-fields'],
        processed.attributes.name,
    );
};

const processIndexConstraint: ChildProcessor<IndexConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        { ...CONSTRAINT_COMMON_ATTRS, name: requireAttribute((attr) => attr) },
        { ...CONSTRAINT_COMMON_CHILDREN, 'key-fields': forEachChild(processKeyFields) },
    );
    return new IndexConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.children['key-fields'],
        processed.attributes.name,
    );
};

const processUniqueConstraint: ChildProcessor<UniqueConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        { ...CONSTRAINT_COMMON_ATTRS },
        { ...CONSTRAINT_COMMON_CHILDREN, 'key-fields': forEachChild(processKeyFields) },
    );
    return new UniqueConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.children['key-fields'],
    );
};

const processMatchesConstraint: ChildProcessor<MatchesConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        {
            ...CONSTRAINT_COMMON_ATTRS,
            pattern: requireAttribute((attribute) => new RegExp(attribute)),
            datatype: requireAttribute(processDatatypeAdapter),
        },
        { ...CONSTRAINT_COMMON_CHILDREN },
    );
    return new MatchesConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.attributes.pattern,
        processed.attributes.datatype,
    );
};

const processAllowedValuesConstraint: ChildProcessor<AllowedValuesConstraint> = (child, _context) => {
    const processed = processElement(
        child,
        {
            ...CONSTRAINT_COMMON_ATTRS,
            'allow-other': requireAttribute(processBooleanAttribute),
        },
        {
            ...CONSTRAINT_COMMON_CHILDREN,
            enum: (children, context) => {
                const allowedValuesMap = new Map<string, IAllowedValue>();
                children.forEach((child) => {
                    const processed = processElement(
                        child,
                        {
                            value: requireAttribute((attr) => attr),
                        },
                        {},
                    );
                    const description = processMarkupLine(child, context);
                    allowedValuesMap.set(processed.attributes.value, {
                        value: processed.attributes.value,
                        description: description,
                    });
                });
                return allowedValuesMap;
            },
        },
    );
    return new AllowedValuesConstraint(
        processed.attributes.id,
        processed.attributes.level,
        processed.children.remarks,
        processed.attributes.target,
        processed.children.enum,
        processed.attributes['allow-other'],
    );
};
