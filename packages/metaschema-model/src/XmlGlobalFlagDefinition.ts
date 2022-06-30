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

import { AbstractMetaschema } from '@oscal/metaschema-model-common';
import {
    AllowedValuesConstraint,
    ExpectConstraint,
    IndexHasConstraint,
    MatchesConstraint,
} from '@oscal/metaschema-model-common/constraint';
import { IDatatypeAdapter } from '@oscal/metaschema-model-common/datatype';
import { AbstractFlagDefinition } from '@oscal/metaschema-model-common/definition';
import { ModuleScope } from '@oscal/metaschema-model-common/util';
import { parseConstraints } from './constraints.js';
import parseDatatypeAdapter from './datatype.js';
import XMLParsingError, {
    JSONObject,
    parseMarkupLine,
    parseMarkupMultiLine,
    parseStringProp,
    parseStringPropRequired,
} from './parseUtil.js';

export default class XmlGlobalFlagDefinition extends AbstractFlagDefinition {
    private readonly metaschema;
    private readonly parsedFlag;

    private readonly allowedValuesConstraints: AllowedValuesConstraint[];
    private readonly matchesConstraints: MatchesConstraint[];
    private readonly indexHasKeyConstraints: IndexHasConstraint[];
    private readonly expectConstraints: ExpectConstraint[];

    getName() {
        return parseStringPropRequired('@_name', 'define-flag', this.parsedFlag);
    }

    getUseName() {
        return parseStringProp('use-name', 'define-flag', this.parsedFlag) ?? this.getName();
    }

    getFormalName() {
        return parseStringProp('formal-name', 'define-flag', this.parsedFlag);
    }

    getDescription() {
        return parseMarkupLine('description', 'define-flag', this.parsedFlag);
    }

    getRemarks() {
        return parseMarkupMultiLine('remarks', 'define-flag', this.parsedFlag);
    }

    getDatatypeAdapter(): IDatatypeAdapter<never> {
        // TODO provide default if not exist
        return parseDatatypeAdapter('@_as-type', 'define-flag', this.parsedFlag);
    }

    getAllowedValuesContraints(): AllowedValuesConstraint[] {
        return this.allowedValuesConstraints;
    }

    getMatchesConstraints(): MatchesConstraint[] {
        return this.matchesConstraints;
    }

    getIndexHasKeyConstraints(): IndexHasConstraint[] {
        return this.indexHasKeyConstraints;
    }

    getExpectConstraints(): ExpectConstraint[] {
        return this.expectConstraints;
    }

    getModuleScope() {
        const scope = parseStringProp('@_scope', 'define-flag', this.parsedFlag);
        if (scope === 'local') {
            return ModuleScope.LOCAL;
        } else if (scope === 'inherited' || scope === undefined) {
            return ModuleScope.INHERITED;
        }
        throw new Error(`Unknown module scope ${scope}`);
    }

    getContainingMetaschema() {
        return this.metaschema;
    }

    getInlineInstance() {
        return undefined;
    }

    isInline() {
        return false;
    }

    constructor(parsedXmlFlagDefinition: JSONObject, metaschema: AbstractMetaschema) {
        super();
        this.metaschema = metaschema;
        this.parsedFlag = parsedXmlFlagDefinition;

        const {
            indexHasKeyConstraints,
            expectConstraints,
            matchesConstrants,
            allowedValuesConstraints,
            ...extraneousConstraints
        } = parseConstraints('constraint', 'define-flag', this.parsedFlag);
        this.indexHasKeyConstraints = indexHasKeyConstraints;
        this.expectConstraints = expectConstraints;
        this.matchesConstraints = matchesConstrants;
        this.allowedValuesConstraints = allowedValuesConstraints;
        Object.values(extraneousConstraints).map((c) => {
            if (c.length > 0) {
                throw new XMLParsingError(`define-flag has extraneous constraint ${c}`);
            }
        });
    }
}
