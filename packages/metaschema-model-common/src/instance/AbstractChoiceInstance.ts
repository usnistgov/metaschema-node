import { modelContainable } from "../definition/IModelContainer";
import { AbstractChoice } from "../element";
import { modelInstanceable } from "./IModelInstance";

/**
 * This marker interface represents a choice of allowed instances in a Metaschema.
 */
export default abstract class AbstractChoiceInstance extends modelContainable(modelInstanceable(AbstractChoice)) {

}