import { atom } from "jotai";
import { atomWithReset, useResetAtom } from 'jotai/utils'
import { IBannerState } from "../utilities/types/types";

import { IDeleteRowAtom, IProductAtom } from "../utilities/types/atomTypes";

interface IBreadcrumbsState {
    pathArr: React.ReactElement[];
}



export const bannerState = atomWithReset <IBannerState> ({    
    variant: "",
    message: "",
    infinite: false,
    additionalErrorDetails: false
});


export const entityState = atomWithReset <IEntityState>({
        action: null,
        category: '',
        path: '',
        id: null,
    });


export const overlaySpinnerState = atomWithReset <Boolean>(false);


export const breadcrumbsState = atomWithReset <IBreadcrumbsState>({
        //? Should it default to some home route?
        pathArr: [],
    });


export const productState = atomWithReset <IProductAtom> (
    {
        productRows: {},
        getProducts: [],
        getUniqueProducts: []
    }
)

export const deleteRowState = atomWithReset <IDeleteRowAtom> (
    // Global listener for table operations that require stateful row deletion/removal without back-end support
    {
        rowId: null
    }
);