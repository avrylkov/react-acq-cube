
export type Metric = {
    code: string
    metrics: MetricValue[]
}

export type MetricValue = {
    name: string
    value: number
}

export enum RequestCubeDeepCode {
    ALL = 'ALL',
    ALL_TB = 'ALL_TB',
    TB = 'TB',
    GOSB = 'GOSB',
    ORG = 'ORG',
}

export type RequestCubeDeepCodeKey = keyof typeof RequestCubeDeepCode

export const RequestCubeDeepName: Record<RequestCubeDeepCode, string> = {
    [RequestCubeDeepCode.ALL]: 'Все',
    [RequestCubeDeepCode.ALL_TB]: 'По каждому ТБ',
    [RequestCubeDeepCode.TB]: 'По ТБ',
    [RequestCubeDeepCode.GOSB]: 'По ГОСБ',
    [RequestCubeDeepCode.ORG]: 'По Организации',
}


export enum SortDirection {
    ASC,
    DESC
}

export enum Projection {
    DEEP,
    LOOK_UP
}

export type RequestCubeDeep = {
    label: string
    code: RequestCubeDeepCode
    codeFilter?: string
    tb?: string
    gosb?: string
    org?: string
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

export class UserState {

    constructor(login: string, time: Date) {
        this.login = login;
        this.time = time;
    }

    login: string
    time: Date
}