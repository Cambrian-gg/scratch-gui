const SET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/SET_GENERATE_IMAGES';
const UNSET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/UNSET_GENERATE_IMAGES';
const SET_SHOULD_GENERATE_IMAGES_WAS_SET = 'scratch-gui/cambrian/decks/SET_SHOULD_GENERATE_IMAGES_WAS_SET';

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
    case SET_SHOULD_GENERATE_IMAGES_WAS_SET:
        return Object.assign({}, state, {
            shouldGenerateImagesWasSet: true
        })
    default:
        return state;
    }
};

const setGenerateImages = () => ({
    type: SET_GENERATE_IMAGES
});

const unsetGenerateImages = () => ({
    type: UNSET_GENERATE_IMAGES,
});

const setShouldGenerateImagesWasSet = () => ({
    type: SET_SHOULD_GENERATE_IMAGES_WAS_SET,
})

export {
    reducer as default,
    initialState as decksInitialState,
    setGenerateImages,
    unsetGenerateImages,
    setShouldGenerateImagesWasSet
};
