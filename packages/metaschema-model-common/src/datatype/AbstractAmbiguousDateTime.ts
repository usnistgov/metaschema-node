import AbstractDatatype from './AbstractDatatype';

export default abstract class AbstractAmbiguousDateTime<
    T extends AbstractAmbiguousDateTime<T>,
> extends AbstractDatatype<T, Date> {
    public readonly hasTimeZone: boolean;

    public constructor(value: Date, hasTimeZone: boolean) {
        super(value);
        this.hasTimeZone = hasTimeZone;
    }
}
