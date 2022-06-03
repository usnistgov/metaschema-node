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

import MarkupMultiLine from '../datatype/markup/markupMultiLine';
import MetapathExpression from '../metapath/MetapathExpression';
import AbstractConstraint, { Level } from './AbstractConstraint';

export default class CardinalityConstraint extends AbstractConstraint {
    private _minOccurs;
    private _maxOccurs;

    constructor(
        id: string | undefined,
        level: Level,
        remarks: MarkupMultiLine | undefined,
        target: MetapathExpression,
        minOccurs: number | undefined,
        maxOccurs: number | undefined,
    ) {
        super(id, level, remarks, target);
        this._minOccurs = minOccurs;
        this._maxOccurs = maxOccurs;
    }

    /**
     * Retrieve the required minimum occurrence of the target instance. If specified, this value must be
     * less than or equal to the value of {@link IModelInstance.getMaxOccurs} and greater than
     * {@link IModelInstance.getMinOccurs}.
     *
     * @returns a non-negative integer or `undefined` if not defined
     */
    get minOccurs() {
        return this._minOccurs;
    }

    /**
     * Retrieve the required maximum occurrence of the target instance. If specified, this value must be
     * less than the value of {@link IModelInstance.getMaxOccurs} and greater than or equal to
     * {@link IModelInstance.getMinOccurs}.
     *
     * @returns a non-negative integer or `undefined` if not defined
     */
    get maxOccurs() {
        return this._maxOccurs;
    }
}
