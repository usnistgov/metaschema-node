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

import { optionalOneChild, processNode, requireAttribute, XmlProcessingError } from '@oscal/data-utils';
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
import { processMarkupLine, processMarkupMultiLine } from './XmlMarkup.js';

export default class XmlGlobalFlagDefinition extends AbstractFlagDefinition {
    private readonly metaschema;
    private readonly flagDefinitionXml;

    private readonly allowedValuesConstraints: AllowedValuesConstraint[];
    private readonly matchesConstraints: MatchesConstraint[];
    private readonly indexHasKeyConstraints: IndexHasConstraint[];
    private readonly expectConstraints: ExpectConstraint[];

    private readonly name;
    getName() {
        return this.name;
    }

    private readonly useName;
    getUseName() {
        return this.useName ?? this.getName();
    }

    private readonly formalName;
    getFormalName() {
        return this.formalName;
    }

    private readonly description;
    getDescription() {
        return this.description;
    }

    private readonly remarks;
    getRemarks() {
        return this.remarks;
    }

    getDatatypeAdapter(): IDatatypeAdapter<never> {
        // TODO provide default if not exist
        throw new Error('Method not implemented');
    }

    getAllowedValuesConstraints(): AllowedValuesConstraint[] {
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

    private readonly moduleScope;
    getModuleScope() {
        return this.moduleScope;
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

    constructor(flagDefinitionXml: HTMLElement, metaschema: AbstractMetaschema) {
        super();
        this.metaschema = metaschema;
        this.flagDefinitionXml = flagDefinitionXml;

        const parsed = processNode(
            flagDefinitionXml,
            {
                name: requireAttribute((attr) => attr),
                scope: (scope, context) => {
                    if (scope === 'local') {
                        return ModuleScope.LOCAL;
                    } else if (scope === 'inherited' || scope === undefined) {
                        return ModuleScope.INHERITED;
                    }
                    throw XmlProcessingError.withContext(context, `Unknown module scope ${scope}`);
                },
            },
            {
                'use-name': optionalOneChild((child) => processNode(child, {}, {}).body),
                'formal-name': optionalOneChild((child) => processNode(child, {}, {}).body),
                description: optionalOneChild(processMarkupLine),
                remarks: optionalOneChild(processMarkupMultiLine),
            },
        );

        this.name = parsed.attributes.name;
        this.moduleScope = parsed.attributes.scope;

        this.useName = parsed.children['use-name'];
        this.formalName = parsed.children['formal-name'];
        this.description = parsed.children.description;
        this.remarks = parsed.children.remarks;

        this.allowedValuesConstraints = [];
        this.matchesConstraints = [];
        this.indexHasKeyConstraints = [];
        this.expectConstraints = [];
    }
}
