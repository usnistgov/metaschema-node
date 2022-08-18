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

import { requireAttribute, optionalOneChild, processElement } from '@oscal/data-utils';
import { processConstraints } from './constraints.js';
import { processDatatypeAdapter } from './datatype.js';
import { processMarkupLine, processMarkupMultiLine } from './markup.js';
import { processModuleScope } from './moduleScope.js';

export const METASCHEMA_NS = 'http://csrc.nist.gov/ns/oscal/metaschema/1.0';

export const MODEL_ELEMENT = {
    ATTRIBUTES: {},
    CHILDREN: {
        '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}remarks': optionalOneChild(processMarkupMultiLine),
    },
} as const;

export const NAMED_MODEL_ELEMENT = {
    ATTRIBUTES: {
        ...MODEL_ELEMENT.ATTRIBUTES,
        name: requireAttribute((attr) => attr),
    },
    CHILDREN: {
        ...MODEL_ELEMENT.CHILDREN,
        '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}use-name': optionalOneChild(
            (child) => processElement(child, {}, {}).body,
        ),
        '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}formal-name': optionalOneChild(
            (child) => processElement(child, {}, {}).body,
        ),
        '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}description': optionalOneChild(processMarkupLine),
    },
} as const;

export const DEFINITION = {
    ATTRIBUTES: {
        ...NAMED_MODEL_ELEMENT.ATTRIBUTES,
        scope: processModuleScope,
    },
    CHILDREN: {
        ...NAMED_MODEL_ELEMENT.CHILDREN,
        '{http://csrc.nist.gov/ns/oscal/metaschema/1.0}constraint': optionalOneChild(processConstraints),
    },
} as const;

export const NAMED_DEFINITION = {
    ATTRIBUTES: {
        ...DEFINITION.ATTRIBUTES,
    },
    CHILDREN: {
        ...DEFINITION.CHILDREN,
    },
} as const;

export const VALUED_DEFINITION = {
    ATTRIBUTES: {
        ...DEFINITION.ATTRIBUTES,
        'as-type': processDatatypeAdapter,
    },
    CHILDREN: {
        ...DEFINITION.CHILDREN,
    },
} as const;

export const NAMED_VALUED_DEFINITION = {
    ATTRIBUTES: {
        ...NAMED_DEFINITION.ATTRIBUTES,
        ...VALUED_DEFINITION.ATTRIBUTES,
    },
    CHILDREN: {
        ...NAMED_DEFINITION.CHILDREN,
        ...VALUED_DEFINITION.CHILDREN,
    },
} as const;
