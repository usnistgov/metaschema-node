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

import { ResourceResolver } from './resolver.js';

/**
 * Wrap a resource resolver in an entity resolver xml preprocessor
 * @param resolver The resolver to map
 * @returns A resource resolver that automatically replaces entities with their resolved value
 */
export function wrapXmlPreprocessor(resolver: ResourceResolver): ResourceResolver {
    return async (location) => {
        const result = await resolver(location);
        return await preprocessXml(result, resolver);
    };
}

/**
 * Replaces all external entities in an XML document with their values
 * @param input XML with external entities
 * @param resolver The entity resolver to use grab entity values
 * @returns XML with resolved entity values
 */
async function preprocessXml(input: string, resolver: ResourceResolver): Promise<string> {
    const entityLocationMap = extractEntities(input);
    const entityValueMap = await resolveEntities(entityLocationMap, resolver);
    return replaceResolvedEntities(input, entityValueMap);
}

const entityRe = /<!ENTITY\s+(?<name>\S+)\s+SYSTEM\s+['"](?<location>[^'"]*)['"]>/gs;

/**
 * Extract entities from an XML document string
 * @param input The XML document string to extract
 * @returns An object where the keys are entity names and the values are the resolved entities
 */
export function extractEntities(input: string): Record<string, string> {
    return [...input.matchAll(entityRe)].reduce((map, curr) => {
        const { name, location } = curr.groups ?? {};
        map[name] = location;
        return map;
    }, {} as Record<string, string>);
}

async function resolveEntities(
    locations: Record<string, string>,
    resolver: ResourceResolver,
): Promise<Record<string, string>> {
    const resolvedEntities: Record<string, string> = {};
    await Promise.all(
        Object.entries(locations).map(
            async ([entity, location]) => (resolvedEntities[entity] = await resolver(location)),
        ),
    );
    return resolvedEntities;
}

const doctypeRe = /(?<=<!DOCTYPE\s+\S+\s+)\[.*?\](?=>)/gs;

function replaceResolvedEntities(input: string, resolvedEntities: Record<string, string>): string {
    // TODO: replace naive impl with something a bit more performant

    Object.entries(resolvedEntities).forEach(([entity, value]) => {
        input = input.replace('&' + entity, value);
    });

    input.replace(doctypeRe, '');

    return input;
}
