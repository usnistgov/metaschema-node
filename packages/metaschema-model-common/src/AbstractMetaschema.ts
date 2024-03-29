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
import MarkupLine from './datatype/markup/MarkupLine.js';
import MarkupMultiLine from './datatype/markup/MarkupMultiLine.js';
import AbstractAssemblyDefinition from './definition/AbstractAssemblyDefinition.js';
import AbstractFieldDefinition from './definition/AbstractFieldDefinition.js';
import AbstractFlagDefinition from './definition/AbstractFlagDefinition.js';
import INamedModelDefinition from './definition/INamedModelDefinition.js';

/**
 * The API for accessing information about a given Metaschema.
 *
 * A Metaschema may import another Metaschema. This import graph can be accessed using
 * {@link importedMetaschemas}.
 *
 * Global scoped Metaschema definitions can be accessed using
 * {@link getScopedAssemblyDefinitionByName()}, {@link getScopedFieldDefinitionByName()}, and
 * {@link getScopedFlagDefinitionByName()}. These methods take into consideration the import
 * order to provide the global definitions that are in scope within the given Metaschema.
 *
 * Global scoped definitions exported by this Metaschema, available for use by importing
 * Metaschemas, can be accessed using {@link exportedAssemblyDefinitions},
 * {@link exportedFieldDefinitions}, and {@link exportedFlagDefinitions}.
 *
 * Global scoped definitions defined directly within the given Metaschema can be accessed using
 * {@link assemblyDefinitions}, {@link fieldDefinitions}, and {@link flagDefinitions}, along with
 * similarly named accessors.
 */
export default abstract class AbstractMetaschema {
    constructor(importedMetaschemas: AbstractMetaschema[]) {
        this._importedMetaschemas = importedMetaschemas;
    }

    /**
     * Retrieves the location where the Metaschema was loaded from.
     * TODO: use an equivalent URI class
     * @returns the location, or `undefined` if this information is not available
     */
    abstract get location(): string | undefined;

    /**
     * Get the long name for the Metaschema.
     */
    abstract get name(): MarkupLine;

    /**
     * Get the revision of the Metaschema.
     */
    abstract get version(): string;

    /**
     * Retrieve the remarks associated with this Metaschema, if any.
     *
     * @returns the remarks or `undefined` if no remarks are defined
     */
    abstract get remarks(): MarkupMultiLine | undefined;

    /**
     * Retrieves the unique short name for the Metaschema, which provides a textual identifier for the
     * Metaschema instance.
     */
    abstract get shortName(): string;

    /**
     * Retrieves the XML namespace associated with the Metaschema.
     */
    abstract get xmlNamespace(): string;

    /**
     * Retrieve the JSON schema base URI associated with the Metaschema.
     */
    abstract get jsonBaseUri(): string;

    private readonly _importedMetaschemas;
    /**
     * Retrieves all Metaschema imported by this Metaschema.
     */
    get importedMetaschemas() {
        return this._importedMetaschemas;
    }

    /**
     * Retrieves the top-level flag definitions in this Metaschema.
     *
     * @returns the collection of flag definitions
     */
    abstract readonly flagDefinitions: Map<string, AbstractFlagDefinition>;

    /**
     * Retrieves the top-level field definitions in this Metaschema.
     *
     * @returns the collection of field definitions
     */
    abstract readonly fieldDefinitions: Map<string, AbstractFieldDefinition>;

    /**
     * Retrieves the top-level assembly definitions in this Metaschema.
     *
     * @returns the collection of assembly definitions
     */
    abstract readonly assemblyDefinitions: Map<string, AbstractAssemblyDefinition>;

    get rootAssemblyDefinitions() {
        return new Map([...this.assemblyDefinitions].filter(([, v]) => v.isRoot()));
    }

    /**
     * Retrieves the top-level assembly and field definitions in this Metaschema.
     *
     * @returns a listing of assembly and field definitions
     */
    get assemblyAndFieldDefinitions(): INamedModelDefinition[] {
        return [...this.assemblyDefinitions.values(), ...this.fieldDefinitions.values()];
    }

    private _exportedFlagDefinitions: Map<string, AbstractFlagDefinition> | undefined;
    /**
     * Retrieve the top-level flag definitions that are marked global in this Metaschema or in any
     * imported Metaschema. The resulting collection is built by adding global definitions from each
     * imported Metaschema in order of import, then adding global definitions from the current
     * Metaschema. Such a map is built in this way for each imported Metaschema in the chain. Values for
     * clashing keys will be replaced in this order, giving preference to the "closest" definition.
     *
     * @returns the collection of exported flag definitions
     */
    get exportedFlagDefinitions(): Map<string, AbstractFlagDefinition> {
        if (this._exportedFlagDefinitions === undefined) {
            this._exportedFlagDefinitions = new Map([
                ...this.flagDefinitions,
                ...this.importedMetaschemas.flatMap((metaschema) => [...metaschema.exportedFlagDefinitions]),
            ]);
        }
        return this._exportedFlagDefinitions;
    }

    private _exportedFieldDefinitions: Map<string, AbstractFieldDefinition> | undefined;
    /**
     * Retrieve the top-level field definitions that are marked global in this Metaschema or in any
     * imported Metaschema. The resulting collection is built by adding global definitions from each
     * imported Metaschema in order of import, then adding global definitions from the current
     * Metaschema. Such a map is built in this way for each imported Metaschema in the chain. Values for
     * clashing keys will be replaced in this order, giving preference to the "closest" definition
     *
     * @returns the collection of exported field definitions
     */
    get exportedFieldDefinitions(): Map<string, AbstractFieldDefinition> {
        if (this._exportedFieldDefinitions === undefined) {
            this._exportedFieldDefinitions = new Map([
                ...this.fieldDefinitions,
                ...this.importedMetaschemas.flatMap((metaschema) => [...metaschema.exportedFieldDefinitions]),
            ]);
        }
        return this._exportedFieldDefinitions;
    }

    private _exportedAssemblyDefinitions: Map<string, AbstractAssemblyDefinition> | undefined;
    /**
     * Retrieve the top-level assembly definitions that are marked global in this Metaschema or in any
     * imported Metaschema. The resulting collection is built by adding global definitions from each
     * imported Metaschema in order of import, then adding global definitions from the current
     * Metaschema. This collection is built in this way for each imported Metaschema in the chain. Items
     * with duplicate names will be replaced in this order, giving preference to the "closest"
     * definition
     *
     * @returns the collection of exported assembly definitions
     */
    get exportedAssemblyDefinitions(): Map<string, AbstractAssemblyDefinition> {
        if (this._exportedAssemblyDefinitions === undefined) {
            this._exportedAssemblyDefinitions = new Map([
                ...this.assemblyDefinitions,
                ...this.importedMetaschemas.flatMap((metaschema) => [...metaschema.exportedAssemblyDefinitions]),
            ]);
        }
        return this._exportedAssemblyDefinitions;
    }

    /**
     * Retrieves the flag definition with a matching name from either: 1) the top-level flag definitions
     * from this Metaschema, or 2) global flag definitions from each imported Metaschema in reverse
     * order of import.
     *
     * @param name the name of the flag definition to find
     * @return the flag definition
     */
    getScopedFlagDefinitionByName(name: string) {
        return this.flagDefinitions.get(name) ?? this.exportedFlagDefinitions.get(name);
    }

    /**
     * Retrieves the field definition with a matching name from either: 1) the top-level field
     * definitions from this Metaschema, or 2) global field definitions from each imported Metaschema in
     * reverse order of import.
     *
     * @param name the name of the field definition to find
     * @return the field definition
     */
    getScopedFieldDefinitionByName(name: string) {
        return this.fieldDefinitions.get(name) ?? this.exportedFieldDefinitions.get(name);
    }

    /**
     * Retrieves the assembly definition with a matching name from either: 1) the top-level assembly
     * definitions from this Metaschema, or 2) global assembly definitions from each imported Metaschema
     * in reverse order of import.
     *
     * @param name the name of the assembly to find
     * @return the assembly definition
     */
    getScopedAssemblyDefinitionByName(name: string) {
        return this.assemblyDefinitions.get(name) ?? this.exportedAssemblyDefinitions.get(name);
    }
}
