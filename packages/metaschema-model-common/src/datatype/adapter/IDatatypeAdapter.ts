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

export default interface IDatatypeAdapter<T> {
    /**
     * Get the metaschema type name associated with this adapter. This name must be unique with respect
     * to all other metaschema types.
     */
    readonly name: string;

    /**
     * Casts the provided value to the type associated with this adapter.
     *
     * @param value a value of the provided type
     * @return the typed value
     */
    toValue(value: unknown): T;

    /**
     * Gets the value as a string suitable for writing as text. This is intended for data types that
     * have a simple string-based structure in XML and JSON, such as for XML attributes or JSON keys. An
     * adapter for a complex data structures that consist of XML elements will throw an
     * {@link UnsupportedOperationError} when this is called.
     *
     * @param value the data to format as a string
     * @return the value formatted as a string
     * @throws {@link UnsupportedOperationError} if the data type cannot be represented as a string
     */
    asString(value: unknown): string;

    /**
     * Determines if the data type is an atomic, scalar value. Complex structures such as Markup are not
     * considered atomic.
     * `true` if the data type is an atomic scalar value, or `false` otherwise
     */
    readonly atomic: boolean;

    /**
     * Gets the default value to use as the JSON/YAML field name for a Metaschema field value if no JSON
     * value key flag or name is configured.
     */
    readonly defaultJsonValueKey: string;

    /**
     * Determines if the data type's value is allowed to be unwrapped in XML when the value is a field
     * value.
     */
    readonly isUnwrappedValueAllowedInXml: boolean;

    /**
     * Determines if the datatype uses mixed text and element content in XML.
     */
    readonly isXmlMixed: boolean;
}
