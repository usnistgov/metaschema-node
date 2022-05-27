import AbstractAssemblyDefinition from '../definition/AbstractAssemblyDefinition';
import AbstractAssembly from '../element/AbstractAssembly';
import { namedModelInstanceable } from './INamedModelInstance';

export default abstract class AbstractAssemblyInstance extends namedModelInstanceable(AbstractAssembly) {
    getJsonName(): string {
        if (this.getMaxOccurs() == -1 || this.getMaxOccurs() > 1) {
            return this.getGroupAsName() ?? 'null group-as name';
        }
        return this.getEffectiveName();
    }

    abstract getDefinition(): AbstractAssemblyDefinition;
}
