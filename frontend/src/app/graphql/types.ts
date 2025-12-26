export type Owner = {
    readonly id: number;
    name: string;
    money?: number;
};

export type Dog = {
    readonly id: number;
    name: string;
    age: number;
    owner?: Owner;
};
