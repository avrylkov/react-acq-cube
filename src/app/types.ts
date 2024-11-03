export type PageDate = {
    total: number
    dataCubes: Metric[]
}

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
    CONTRACT = 'CONTRACT',
    SHOP = 'SHOP',
}

export type RequestCubeDeepCodeKey = keyof typeof RequestCubeDeepCode

export interface DeepNameLabelInfo {
    parent: string
    child?: string
}

export const RequestCubeDeepName: Record<RequestCubeDeepCode, DeepNameLabelInfo> = {
    [RequestCubeDeepCode.ALL]: {parent: 'Все'},
    [RequestCubeDeepCode.ALL_TB]: {parent:'По каждому ТБ', child: 'Код ТБ'},
    [RequestCubeDeepCode.TB]: {parent: 'По ТБ', child: 'Код ГОСБ'},
    [RequestCubeDeepCode.GOSB]: {parent:'По ГОСБам', child:'ИНН/КПП'},
    [RequestCubeDeepCode.ORG]: {parent:'По Организации', child:'№ Договора'},
    [RequestCubeDeepCode.CONTRACT]: {parent:'По Договору', child:'Мид ТСТ'},
    [RequestCubeDeepCode.SHOP]: {parent:'По ТСТ', child:'Тид Терминала'},
}


export enum SortDirection {
    ASC,
    DESC
}

export enum Projection {
    DEEP,
    LOOK_UP
}

export type PageInfo = {
    pageNumber: number
    pageSize: number
}

export type RequestCubeDeep = {
    pageInfo: PageInfo
    label: string
    code: RequestCubeDeepCode
    codeFilter?: string
    tb?: string
    gosb?: string
    org?: string
    contract?: string
    shop?: string
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

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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