export type PageDateDeep = {
    total: number
    dataCubes: Metric[]
}

export type PageDateLookUp = {
    total: number
    dataCubes: TbTreeData[]
}

export interface TbTreeData {
    code: string
    gosbs: GosbTreeData[]
}

export interface GosbTreeData {
    code: string
    organizations: OrgTreeData[]
}

export interface OrgTreeData {
    code: string
    contracts: ContrTreeData[]
}

export interface ContrTreeData {
    code: string
    shops: ShopTreeData[]
}

export interface ShopTreeData {
    code: string
    terminals: TerminalTreeData[]
}

export interface TerminalTreeData {
    code: string
}

export interface TreeData {
    key: string
    title: string
    children: TreeData[]
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
    LOOK_UP,
    NONE
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

export enum LOOK_UP_LEVEL {
    TB ='TB',
    GOSB = 'GOSB',
    ORGANIZATION = 'ORGANIZATION',
    CONTRACT = 'CONTRACT',
    SHOP = 'SHOP',
    TERMINAL = 'TERMINAL',
    NONE = 'NONE'
}

export type RequestCubeLookUp = {
    pageInfo: PageInfo
    code: string
    level: LOOK_UP_LEVEL
}

interface IStack<T> {
    push(item: T): void;
    pop(): T | undefined;
    last(): T | undefined;
    get(index: number): T;
    size(): number;
    clear(): void;
    removeLast(deleteCount: number): void;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DEEP_PAGE_SIZE = 20;
export const FIRST_DEEP_REQUEST : RequestCubeDeep =
     {label: RequestCubeDeepName[RequestCubeDeepCode.ALL].parent,
        code: RequestCubeDeepCode.ALL,  pageInfo: {pageNumber : 1, pageSize : DEEP_PAGE_SIZE}}

export const LOOK_UP_PAGE_SIZE = 50;
export const FIRST_LOOK_UP_REQUEST : RequestCubeLookUp =
    {level: LOOK_UP_LEVEL.NONE, code: '', pageInfo: {pageNumber : 1, pageSize : LOOK_UP_PAGE_SIZE}}

export class Stack<T> implements IStack<T> {
    private storage: T[] = [];

    constructor(init: T, private capacity: number = Infinity) {
        this.storage.push(init)
    }

    push(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    last(): T | undefined {
        return this.storage[this.storage.length - 1];
    }

    get(index: number): T {
        return this.storage[index];
    }

    items(): T[] {
        return this.storage.slice(0);
    }


    size(): number {
        return this.storage.length;
    }

    first(): T | undefined {
        return this.storage[0]
    }

    clear() {
       this.storage.splice(0, this.storage.length)
    }

    removeLast(deleteCount: number) {
        this.storage.splice(this.storage.length - deleteCount)
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

