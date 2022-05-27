export function equals<T>(o1: T, o2: T) {
    return JSON.stringify(o1) === JSON.stringify(o2);
}
