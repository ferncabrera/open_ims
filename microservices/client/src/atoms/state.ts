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