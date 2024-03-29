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

import INamedDefinition from '../../definition/INamedDefinition.js';
import INamedInstance from '../../instance/INamedInstance.js';
import AbstractItem from './AbstractItem.js';
import { UnconstrainedDocument } from './DocumentItem.js';

/**
 * Helper function to tell Instances and Definitions apart
 */
export function isInstance<Definition extends INamedDefinition, Instance extends INamedInstance>(
    instanceOrDefinition: Instance | Definition,
): instanceOrDefinition is Instance {
    return instanceOrDefinition.discriminator === 'instance';
}

type Parent = UnconstrainedNodeItem | UnconstrainedDocument;

export default abstract class AbstractNodeItem<
    T,
    Definition extends INamedDefinition,
    Instance extends INamedInstance,
> extends AbstractItem<T> {
    private _parent: Parent | undefined;

    public get parent() {
        if (this._parent === undefined) {
            throw new Error('Parent not registered');
        }
        return this._parent;
    }

    public registerParent(parent: Parent) {
        this._parent = parent;
    }

    readonly definition: Definition;
    readonly instance: Instance | undefined;

    protected registerChildren() {
        // Does nothing by default
    }

    constructor(value: T, definitionOrInstance: Definition | Instance) {
        super(value);
        if (isInstance(definitionOrInstance)) {
            this.instance = definitionOrInstance;
            // Assure the TSC that an instance's definition is of the correct subtype
            this.definition = definitionOrInstance.getDefinition() as Definition;
        } else {
            this.definition = definitionOrInstance;
        }
        this.registerChildren();
    }
}

export type UnconstrainedNodeItem = AbstractNodeItem<unknown, INamedDefinition, INamedInstance>;
