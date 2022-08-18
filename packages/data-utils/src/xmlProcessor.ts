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

import { AttributeProcessor, ChildListProcessor, XmlProcessingError } from './xmlProcessorUtil.js';

export function processElement<
    AttributeProcessors extends Record<string, AttributeProcessor<unknown>>,
    ChildProcessors extends Record<string, ChildListProcessor<unknown>>,
>(
    element: HTMLElement,
    attributeProcessors: AttributeProcessors,
    childProcessors: ChildProcessors,
    throwErrorOnUnexpected = false,
): {
    attributes: {
        [Property in keyof AttributeProcessors]: ReturnType<AttributeProcessors[Property]>;
    };
    children: {
        [Property in keyof ChildProcessors]: ReturnType<ChildProcessors[Property]>;
    };
    body: string;
} {
    return {
        attributes: processAttributes(element, attributeProcessors, throwErrorOnUnexpected),
        ...processChildren(element, childProcessors, throwErrorOnUnexpected),
    };
}

/**
 * Parse attributes
 * @param element The attributes record to process
 * @param attributeProcessors The record of attributes processor
 * @param throwErrorOnUnexpected Throw an error if an undefined attribute is found
 * @returns The record of processed attributes
 */
export function processAttributes<AttributeProcessors extends Record<string, AttributeProcessor<unknown>>>(
    element: HTMLElement,
    attributeProcessors: AttributeProcessors,
    throwErrorOnUnexpected = false,
) {
    const ret: Record<string, unknown> = {};
    for (let i = 0; i < element.attributes.length; i++) {
        const attributeNode = element.attributes[i];
        const attributeNS = attributeNode.namespaceURI;
        const nsKey = `{${attributeNS ?? ''}}${attributeNode.localName}`;
        if (attributeNS && nsKey in attributeProcessors) {
            ret[nsKey] = attributeProcessors[nsKey](attributeNode.value, { parent: element, name: nsKey });
        } else if (attributeNode.name in attributeProcessors) {
            ret[attributeNode.name] = attributeProcessors[attributeNode.name](attributeNode.value, {
                parent: element,
                name: attributeNode.name,
            });
        } else {
            if (throwErrorOnUnexpected && !attributeNode.name.startsWith('xmlns')) {
                throw new XmlProcessingError(`Unexpected attribute(s) of parent ${element.tagName} element`);
            }
            continue;
        }
    }
    Object.keys(attributeProcessors).forEach((key) => {
        if (!(key in ret)) {
            ret[key] = attributeProcessors[key](null, { parent: element, name: key });
        }
    });

    return ret as {
        [Property in keyof AttributeProcessors]: ReturnType<AttributeProcessors[Property]>;
    };
}

/**
 * Process children and extract the body of an element
 * @param element
 * @param childProcessors
 * @param throwErrorOnUnexpected
 * @returns The record of processed children + the extracted body
 */
export function processChildren<ChildProcessors extends Record<string, ChildListProcessor<unknown>>>(
    element: HTMLElement,
    childProcessors: ChildProcessors,
    throwErrorOnUnexpected = false,
) {
    const childElements: Record<string, Array<HTMLElement>> = {};
    const rawBody: string[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
        const rawChild = element.childNodes[i];
        if (rawChild.nodeType === rawChild.ELEMENT_NODE) {
            const child = rawChild as HTMLElement;
            const nsKey = `{${child.namespaceURI ?? ''}}${child.localName}`;
            if (!(nsKey in childElements)) {
                childElements[nsKey] = [];
            }
            childElements[nsKey].push(child);
        } else if (rawChild.nodeType === rawChild.TEXT_NODE) {
            const child = rawChild as Text;
            rawBody.push(child.data.trim());
        } else if (rawChild.nodeType !== rawChild.COMMENT_NODE && throwErrorOnUnexpected) {
            throw new XmlProcessingError(`Unexpected child type of parent ${element.tagName}`);
        }
    }

    const children: Record<string, unknown> = {};
    Object.keys(childElements).forEach((key) => {
        const childList = childElements[key];
        const tagName = childList[0].tagName;
        if (key in childProcessors) {
            children[key] = childProcessors[key](childList, { parent: element, name: key });
        } else if (tagName in childProcessors) {
            children[tagName] = childProcessors[tagName](childList, { parent: element, name: tagName });
        } else if (throwErrorOnUnexpected) {
            throw new XmlProcessingError(`Unexpected child(ren) of parent ${element.tagName} element`);
        }
    });
    Object.keys(childProcessors).forEach((key) => {
        if (!(key in children)) {
            children[key] = childProcessors[key]([], { parent: element, name: key });
        }
    });

    const cleanBody = rawBody.join(' ').trim();

    return {
        children: children as {
            [Property in keyof ChildProcessors]: ReturnType<ChildProcessors[Property]>;
        },
        body: cleanBody,
    };
}
