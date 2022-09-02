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

// import { loadCardinalityConstraint } from './constraints.js';
import { parseXml } from '@oscal/data-utils';
import { placeholderContext } from '../testUtil/index.js';
import { processConstraints } from './constraints.js';

describe('parseConstraints()', () => {
    it('should parse empty set of constraints', () => {
        const constraintXml = parseXml(`<constraint></constraint>`).documentElement;
        const constraints = processConstraints(constraintXml, placeholderContext);
        Object.values(constraints).forEach((c) => {
            expect(c.length).toBe(0);
        });
    });
});

// describe('parseLevel()', () => {
//     it('should default level to ERROR', () => {
//         // calls parseLevel under the hood without a `level` property
//         const rawXml = `<has-cardinality target="rlink|base64"/>`;
//         const parsedXmlConstraint = parseObjectPropRequired('has-cardinality', '*root*', parseXml(rawXml));
//         const constraint = loadCardinalityConstraint(parsedXmlConstraint);
//         expect(constraint.level).toBe(Level.ERROR);
//     });
//     it('should throw error on invalid level', () => {
//         // calls parseLevel under the hood without a `level` property
//         const rawXml = `<has-cardinality level="KINDA-BAD" target="rlink|base64"/>`;
//         const parsedXmlConstraint = parseObjectPropRequired('has-cardinality', '*root*', parseXml(rawXml));
//         expect(() => loadCardinalityConstraint(parsedXmlConstraint)).toThrow();
//     });
// });

// describe('loadCardinalityConstraint()', () => {
//     it('should parse a complete example', () => {
//         const rawXml = `<has-cardinality id="some-unique-id" level="WARNING" target="rlink|base64" min-occurs="1" max-occurs="5"/>`;
//         const parsedXmlConstraint = parseObjectPropRequired('has-cardinality', '*root*', parseXml(rawXml));
//         const constraint = loadCardinalityConstraint(parsedXmlConstraint);
//         expect(constraint.id).toBe('some-unique-id');
//         expect(constraint.level).toBe(Level.WARNING);
//         expect(constraint.minOccurs).toBe(1);
//         expect(constraint.maxOccurs).toBe(5);
//         expect(constraint.target.toString()).toBe('rlink|base64');
//     });
//     it('should fail without target', () => {
//         const rawXml = `<has-cardinality id="some-unique-id" level="WARNING" min-occurs="1" max-occurs="5"/>`;
//         const parsedXmlConstraint = parseObjectPropRequired('has-cardinality', '*root*', parseXml(rawXml));
//         expect(() => loadCardinalityConstraint(parsedXmlConstraint)).toThrow();
//     });
// });
