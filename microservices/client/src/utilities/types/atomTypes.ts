
export interface IProductAtom {
    productRows: {};
    getProducts: any[]; // any because teh backend is responsible for constructing and sending data which can change frequently.
    getUniqueProducts: any[]; // any because teh backend is responsible for constructing and sending data which can change frequently.
}