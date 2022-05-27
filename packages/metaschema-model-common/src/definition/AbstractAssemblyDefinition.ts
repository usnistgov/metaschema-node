import { AbstractAssembly } from "../element";
import { modelContainable } from "./IModelContainer";
import { namedModelDefineable } from "./INamedModelDefinition";

export default abstract class AbstractAssemblyDefinition extends modelContainable(namedModelDefineable(AbstractAssembly)) { }
