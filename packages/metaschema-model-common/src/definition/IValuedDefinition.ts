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
import AllowedValuesConstraint from '../constraint/AllowedValuesConstraint.js';
import ExpectConstraint from '../constraint/ExpectConstraint.js';
import IndexHasConstraint from '../constraint/IndexHasConstraint.js';
import MatchesConstraint from '../constraint/MatchesConstraint.js';
import IDatatypeAdapter from '../datatype/adapter/IDatatypeAdapter.js';
import AbstractNamedModelElement from '../element/AbstractNamedModelElement.js';
import { AbstractConstructor } from '../util/mixin.js';
import IDefinition, { defineable } from './IDefinition.js';

/**
 * This marker interface identifies Metaschema definition types that have associated values (i.e.,
 * field, flag).
 */
export default interface IValuedDefinition extends IDefinition {
    getDatatypeAdapter(): IDatatypeAdapter<never>;

    /**
     * Retrieve the list of allowed value constraints that apply to this definition's value.
     *
     * @returns the list of allowed value constraints
     */
    getAllowedValuesConstraints(): AllowedValuesConstraint[];

    /**
     * Retrieve the list of matches constraints that apply to this definition's value.
     *
     * @returns the list of matches constraints
     */
    getMatchesConstraints(): MatchesConstraint[];

    /**
     * Retrieve the list of key reference constraints that apply to this definition's value.
     *
     * @returns the list of key reference constraints
     */
    getIndexHasKeyConstraints(): IndexHasConstraint[];

    /**
     * Retrieve the list of expect constraints that apply to this definition's value.
     *
     * @returns the list of expect constraints
     */
    getExpectConstraints(): ExpectConstraint[];
}

export function valuedDefineable<TBase extends AbstractConstructor<AbstractNamedModelElement>>(Base: TBase) {
    abstract class ValuedDefinition extends defineable(Base) implements IValuedDefinition {
        abstract getDatatypeAdapter(): IDatatypeAdapter<never>;
        abstract getAllowedValuesConstraints(): AllowedValuesConstraint[];
        abstract getMatchesConstraints(): MatchesConstraint[];
        abstract getIndexHasKeyConstraints(): IndexHasConstraint[];
        abstract getExpectConstraints(): ExpectConstraint[];
    }
    return ValuedDefinition;
}
