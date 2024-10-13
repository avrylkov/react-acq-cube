
export type Metric = {
    code: string
    metrics: MetricValue[]
}

export type MetricValue = {
    name: string
    value: number
}

export enum RequestCubeDeepCode {
    ALL,
    ALL_TB,
    TB,
    GOSB
}

export enum SortDirection {
    ASC,
    DESC
}

export enum Projection {
    DEEP,
    LOOK_UP
}

type RequestCubeDeepCodeKeys = keyof typeof RequestCubeDeepCode;

export type RequestCubeDeep = {
    label: string
    code: RequestCubeDeepCodeKeys
    codeFilter?: string
    tb?: string
    gosb?: string
}

export type RequestCubeLookUp = {
    contract?: string
    organization?: string
}

interface IStack<T> {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    size(): number;
}

export class Stack<T> implements IStack<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    push(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    peek(): T | undefined {
        return this.storage[this.size() - 1];
    }

    size(): number {
        return this.storage.length;
    }

    first(): T | undefined {
        return this.storage[0]
    }

}