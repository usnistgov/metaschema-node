export default interface IDatatype<T extends IDatatype<T>> {
    copy(): T;
}
