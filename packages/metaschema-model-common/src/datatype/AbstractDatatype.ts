import IDatatype from "./IDatatype";

export default abstract class AbstractDatatype<T extends IDatatype<T>, V> implements IDatatype<T> {
    abstract copy(): T;

    private readonly _value: V;

    protected constructor(value: V) {
        this._value = value;
    }

    get value() {
        return this._value;
    }
}