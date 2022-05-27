import AbstractFieldDefinition from '../definition/AbstractFieldDefinition';
import { AbstractFlag } from '../element';
import { equals } from '../util/equality';
import { namedInstanceable } from './INamedInstance';

export default abstract class AbstractFlagInstance extends namedInstanceable(AbstractFlag) {
    /**
     * Determines if a flag value is required to be provided.
     *
     * @returns `true` if a value is required, or `false` otherwise
     */
    abstract isRequired(): boolean;

    /**
     * Determines if this flag's value is used as the property name for the JSON object that holds the
     * remaining data based on this flag's containing definition.
     *
     * TODO investigate ways to avoid this problem entirely
     *
     * @returns `true` if this flag is used as a JSON key, or `false` otherwise
     */
    isJsonKey(): boolean {
        return equals(this, this.getContainingDefinition().getJsonKeyFlagInstance());
    }

    /**
     * Determines if this flag is used as a JSON "value key". A "value key" is a flag who's value is
     * used as the property name for the containing objects value.
     *
     * @returns `true` if the flag is used as a JSON "value key", or `false` otherwise
     */
    isJsonValueKey(): boolean {
        return this.getContainingDefinition() instanceof AbstractFieldDefinition && this.isJsonKey();
    }
}
