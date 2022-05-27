/**
 * An enumeration that identifies the type of a Metaschema construct.
 */
export enum ModelType {
    ASSEMBLY,
    FIELD,
    FLAG,
    CHOICE,
}

export enum XmlGroupAsBehavior {
    /**
     * In XML, child element instances will be wrapped by a grouping element.
     */
    GROUPED,
    /**
     * In XML, child element instances will exist in an unwrapped form.
     */
    UNGROUPED,
}

export enum JsonGroupAsBehavior {
    /**
     * In JSON, the group of instances will be represented as a JSON object, with each instance's JSON
     * key used as the property and the remaining data represented as a child object of that property.
     */
    KEYED,
    /**
     * In JSON, the group of instances will be represented as a single JSON object if there is one, or
     * as an array of JSON objects if there is more than one. An empty array will be used when no items
     * exist in the group.
     */
    SINGLETON_OR_LIST,
    /**
     * In JSON, the group of instances will be represented as an array of JSON objects if there is more
     * than one. An empty array will be used when no items exist in the group.
     */
    LIST,
    /**
     * In JSON, the group of instances will be represented as a single JSON object.
     */
    NONE,
}

export enum ModuleScope {
    /**
     * The definition is scoped to only the defining module.
     */
    LOCAL,
    /**
     * The definition is scoped to its defining module and any importing module.
     */
    INHERITED,
}
