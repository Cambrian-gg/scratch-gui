const SET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/SET_GENERATE_IMAGES';
const UNSET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/UNSET_GENERATE_IMAGES';

const initialState = {
    shouldGenerateImages: false,
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_GENERATE_IMAGES:
        return Object.assign({}, state, {
            shouldGenerateImages: true
        });
    case UNSET_GENERATE_IMAGES:
        return Object.assign({}, state, {
            shouldGenerateImages: false
        });
    default:
        return state;
    }
};
const setGenerateImages = function(){
    return {
        type: SET_GENERATE_IMAGES
    }
};
const unsetGenerateImages = () => ({
    type: UNSET_GENERATE_IMAGES,
});

export {
    reducer as default,
    initialState as decksInitialState,
    setGenerateImages,
    unsetGenerateImages
};
