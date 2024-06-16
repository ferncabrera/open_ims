import { atom } from "recoil";

export const bannerState = atom({
    key: 'bannerState',
    default: {}
});

export const entityState = atom({
    key: 'entityState',
    default: {
        action: null,
        category: '',
        path: '',
        id: null,
    }
});

export const overlaySpinnerState = atom({
    key: 'overlaySpinnerState',
    default: false
});

export const breadcrumbsState = atom({
    key: 'breadcrumbsState',
    default: {
        pathArr: [],
    }
});

export const productState = atom({
    key:'productState',
    default: {
        productRows: {},
        getProducts: [],
        getUniqueProducts: []
    }
})