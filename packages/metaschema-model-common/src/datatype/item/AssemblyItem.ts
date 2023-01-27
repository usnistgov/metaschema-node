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

import AbstractAssemblyDefinition from '../../definition/AbstractAssemblyDefinition.js';
import AbstractAssemblyInstance from '../../instance/AbstractAssemblyInstance.js';
import AbstractModelNodeItem, { UnconstrainedFlagsContainer } from './AbstractModelNodeItem.js';
import FieldItem, { UnconstrainedFieldContainer } from './FieldItem.js';

/**
 * An assembly container defines the contents of an assembly, which is
 * represented here as key-value pairs where the **key** is the
 * *effective name* of the child model and the *value* is a tuple of the
 * model's contents (some atomic type in the case of a field, or another
 * assembly container in the case of an assembly) and the model's flags.
 */
export type AssemblyContainer<
    ModelType extends Record<
        string,
        {
            model: UnconstrainedFieldContainer | UnconstrainedAssemblyContainer;
            flags: UnconstrainedFlagsContainer;
        }
    >,
> = {
    [Property in keyof ModelType]: ModelType[Property]['model'] extends UnconstrainedAssemblyContainer
        ? // If an assembly container was passed in, the model must be an assembly
          AssemblyItem<ModelType[Property]['model'], ModelType[Property]['flags']>
        : // Otherwise its a field
          FieldItem<ModelType[Property]['model'], ModelType[Property]['flags']>;
};

export type UnconstrainedAssemblyContainer = AssemblyContainer<
    Record<
        string,
        {
            model: UnconstrainedFieldContainer | UnconstrainedAssemblyContainer;
            flags: UnconstrainedFlagsContainer;
        }
    >
>;

export default class AssemblyItem<
    Model extends UnconstrainedAssemblyContainer,
    Flags extends UnconstrainedFlagsContainer,
> extends AbstractModelNodeItem<Model, Flags, AbstractAssemblyDefinition, AbstractAssemblyInstance> {
    protected registerChildren() {
        super.registerChildren();
        for (const item of Object.values(this.value.model)) {
            item.registerParent(this);
        }
    }
}

export type UnconstrainedAssemblyItem = AssemblyItem<UnconstrainedAssemblyContainer, UnconstrainedFlagsContainer>;
