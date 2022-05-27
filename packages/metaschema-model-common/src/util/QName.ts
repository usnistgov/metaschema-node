export default class QName {
    private readonly _name: string;
    private readonly _namespace: string | undefined;

    public get name() {
        return this._name;
    }

    public get namespace() {
        return this._namespace;
    }

    constructor(name: string, namespace?: string) {
        this._name = name;
        this._namespace = namespace;
    }

    toString(): string {
        return this._namespace ? this._namespace + ':' + this._name : this._name;
    }
}