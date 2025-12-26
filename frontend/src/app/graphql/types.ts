export type Owner = {
    readonly id: string;
    name: string;
    money?: number;
};

export type Dog = {
    readonly id: string;
    name: string;
    age: number;
    owner?: Owner;
};
