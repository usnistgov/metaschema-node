import AbstractField from '../element/AbstractField';
import AbstractFlagInstance from '../instance/AbstractFlagInstance';
import { namedModelDefineable } from './INamedModelDefinition';
import { namedValuedDefineable } from './INamedValuedDefinition';

export default abstract class AbstractFieldDefinition extends namedValuedDefineable(
    namedModelDefineable(AbstractField),
) /*implements IModelContainer*/ {
    /**
     * Retrieves the flag instance who's value will be used as the "value key".
     *
     * @returns the configured flag instance, or `undefined` if a flag is not configured as the "value key"
     */
    abstract getJsonValueKeyFlagInstance(): AbstractFlagInstance | undefined;

    /**
     * Check if a JSON value key flag is configured.
     *
     * @returns `true` if a JSON value key flag is configured, or `false` otherwise
     */
    hasJsonValueKeyFlagInstance() {
        return this.getJsonValueKeyFlagInstance() !== undefined;
    }

    /**
     * Retrieves the configured static label to use as the value key, or the type specific name if a
     * label is not configured.
     *
     * @returns the value key label
     */
    abstract getJsonValueKeyName(): string;

    /**
     * Retrieves the key to use as the field name for this field's value in JSON.
     *
     * @returns a string or a FlagInstance value
     */
    getJsonValueKey() {
        return this.getJsonValueKeyFlagInstance() ?? this.getJsonValueKeyName();
    }

    /**
     * Determines if the field is collapsible. If a field is collapsible, then in JSON the values for
     * all fields that have the same flag values can be represented as a single object with a "value"
     * property that contains an array of values. This packing of values can make the resulting JSON
     * more concise.
     *
     * @returns `true` if the field is eligible for collapsing, or `false` otherwise
     */
    abstract isCollapsible(): boolean;
}
