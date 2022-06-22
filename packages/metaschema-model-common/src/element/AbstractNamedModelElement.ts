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
import MarkupLine from '../datatype/markup/MarkupLine.js';
import AbstractModelElement from './AbstractModelElement.js';

/**
 * A marker interface for Metaschema constructs that can be members of a Metaschema definition's
 * model that are named.
 */
export default abstract class AbstractNamedModelElement extends AbstractModelElement {
    /**
     * Retrieve the name of the model element.
     */
    abstract readonly name: string;

    /**
     * Retrieve the name to use for the model element, instead of the name.
     *
     * @returns the use name or `undefined` if no use name is defined
     */
    abstract readonly useName: string | undefined;

    /**
     * The formal display name for a definition.
     */
    abstract readonly formalName: string | undefined;

    /**
     * Get the name to use based on the provided names. This method will return the use name provided by
     * {@link AbstractNamedModelElement.useName} if the call is not `null`, and fall back to the name provided by
     * {@link AbstractNamedModelElement.name} otherwise. This is the model name to use for the for an instance where the
     * instance is referenced.
     *
     * @returns the use name if available, or the name if not
     */
    get effectiveName(): string {
        return this.useName ?? this.name;
    }

    /**
     * Get the name used for the associated property in JSON/YAML.
     *
     * @returns the JSON property name
     */
    get jsonName(): string {
        return this.effectiveName;
    }

    /**
     * Get the text that describes the basic use of the definition
     */
    abstract readonly description: MarkupLine | undefined;
}
