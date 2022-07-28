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
import { DOMParser } from '@xmldom/xmldom';

export function parseXml(raw: string | Buffer) {
    return new DOMParser().parseFromString(raw.toString(), 'text/xml');
}

export class XmlProcessingError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, XmlProcessingError.prototype);
    }

    /**
     * Attach the XML processing context to the error message
     * @param context The context to add to the error
     * @param msg The error message
     */
    static withContext(context: Context, msg: string) {
        // TODO: add context string to error message
        return new XmlProcessingError(msg);
    }
}

export type Context = {
    parent: HTMLElement;
};

type AttributeValue = ReturnType<HTMLElement['getAttributeNS']>;

type Processor<InputT, ReturnT> = (input: InputT, context: Context) => ReturnT;
export type AttributeProcessor<T> = Processor<AttributeValue, T>;
export type DefiniteAttributeProcessor<T> = Processor<NonNullable<AttributeValue>, T>;
export type ChildListProcessor<T> = Processor<HTMLElement[], T>;
export type ChildProcessor<T> = Processor<HTMLElement, T>;

/**
 * Canned utility XML processors
 */

/**
 * Throw an error if the attribute does not exist
 * @param definiteAttributeProcessor The processor to wrap
 * @returns The wrapped attribute processor
 */
export function requireAttribute<T>(definiteAttributeProcessor: DefiniteAttributeProcessor<T>): AttributeProcessor<T> {
    return (attribute, context) => {
        if (attribute === null) {
            throw XmlProcessingError.withContext(context, 'A required attribute was not provided');
        }
        return definiteAttributeProcessor(attribute, context);
    };
}

/**
 * Return undefined if the attribute does not exist
 * @param definiteAttributeProcessor The processor to wrap
 * @returns The wrapped attribute processor
 */
export function undefineableAttribute<T>(
    definiteAttributeProcessor: DefiniteAttributeProcessor<T>,
): AttributeProcessor<T | undefined> {
    return (attribute, context) => {
        if (attribute === null) {
            return undefined;
        }
        return definiteAttributeProcessor(attribute, context);
    };
}

/**
 * Apply a transformation to each child and return a list
 * @param childProcessor A function designed to process a single element
 * @returns The list of transformed children
 */
export function forEachChild<T>(childProcessor: Processor<HTMLElement, T>): ChildListProcessor<T[]> {
    return (children, context) => children.map((child) => childProcessor(child, context));
}

export function optionalOneChild<T>(childProcessor: Processor<HTMLElement, T>): ChildListProcessor<T | undefined> {
    return (children, context) => {
        if (children.length === 0) {
            return undefined;
        }

        if (children.length > 1) {
            throw XmlProcessingError.withContext(context, `Expected 1 or no children but received ${children.length}`);
        }

        return childProcessor(children[0], context);
    };
}

export function requireOneChild<T>(childProcessor: Processor<HTMLElement, T>): ChildListProcessor<T> {
    return (children, context) => {
        if (children.length != 1) {
            throw XmlProcessingError.withContext(context, `Expected exactly 1 child but received ${children.length}`);
        }
        return childProcessor(children[0], context);
    };
}