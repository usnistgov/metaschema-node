import AbstractNamedModelElement from './AbstractNamedModelElement';
import { ModelType } from '../util/types';

/**
 * A marker for an information element that is a field model type.
 */
export default abstract class AbstractAssembly extends AbstractNamedModelElement {
    /**
     * Provides the Metaschema model type of `FIELD`.
     *
     * @returns the model type
     */
    getModelType(): ModelType {
        return ModelType.FIELD;
    }
}
