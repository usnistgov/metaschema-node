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
import CardinalityConstraint from '../constraint/CardinalityConstraint.js';
import IndexConstraint from '../constraint/IndexConstraint.js';
import UniqueConstraint from '../constraint/UniqueConstraint.js';
import AbstractAssembly from '../element/AbstractAssembly.js';
import QName from '../util/QName.js';
import { modelContainerMixin } from './IModelContainer.js';
import { namedModelDefinitionMixin } from './INamedModelDefinition.js';

export default abstract class AbstractAssemblyDefinition extends modelContainerMixin(
    namedModelDefinitionMixin(AbstractAssembly),
) {
    /**
     * Get any index constraints associated with this assembly definition.
     *
     * @returns the collection of index constraints, which may be empty
     */
    abstract getIndexConstraints(): IndexConstraint[];

    /**
     * Get any unique constraints associated with this assembly definition.
     *
     * @returns the collection of unique constraints, which may be empty
     */
    abstract getUniqueConstraints(): UniqueConstraint[];

    /**
     * Get any cardinality constraints associated with this assembly definition.
     *
     * @returns the collection of cardinality constraints, which may be empty
     */
    abstract getCardinalityConstraints(): CardinalityConstraint[];

    /**
     * Get the root name.
     *
     * @returns the root name
     */
    abstract getRootName(): string | undefined;

    /*
     * @returns true if getRootName is set
     */
    isRoot() {
        return this.getRootName() !== undefined;
    }

    /**
     * Get the XML qualified name to use in XML as the root element.
     *
     * @returns the root XML qualified name
     */
    getRootXmlQName() {
        const rootName = this.getRootName();
        if (rootName) {
            return new QName(rootName, this.getContainingMetaschema().xmlNamespace);
        }
    }

    /**
     * Get the name used for the associated property in JSON/YAML.
     *
     * @returns the root JSON property name
     */
    getRootJsonName() {
        return this.getRootName();
    }
}
