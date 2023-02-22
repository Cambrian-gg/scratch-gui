const SET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/SET_GENERATE_IMAGES';
const UNSET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/UNSET_GENERATE_IMAGES';
const SET_SHOULD_GENERATE_IMAGES_WAS_SET = 'scratch-gui/cambrian/decks/SET_SHOULD_GENERATE_IMAGES_WAS_SET';
const SET_SELECTED_CARD_IDS = 'scratch-gui/cambrian/decks/SET_SELECTED_CARD_IDS';
const TOGGLE_EDIT_ON_CATEGORY_ID = 'scratch-gui/cambrian/decks/TOGGLE_EDIT_ON_CATEGORY_ID';

const initialState = {
    shouldGenerateImages: false,
    selectedCardIds: [],
    editableCategoryIds: {},
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

    case SET_SELECTED_CARD_IDS:
        let selectedCardIds = []

        if (action.value){
            selectedCardIds = [...state.selectedCardIds, ...action.cardIds];
        } else {
            console.log(action)
            selectedCardIds = state.selectedCardIds.filter(id => !action.cardIds.includes(id));
        }

        const onlyUnique = (value, index, array) => {
            return array.indexOf(value) === index;
        }

        return Object.assign({}, state, {
            selectedCardIds: selectedCardIds.filter(onlyUnique)
        });

    case TOGGLE_EDIT_ON_CATEGORY_ID:
        const editableCategoryIds = { ...state.editableCategoryIds };
        action.categoryIds.forEach(categoryId => {
            editableCategoryIds[categoryId] = !editableCategoryIds[categoryId];
        });


        return Object.assign({}, state, {
            editableCategoryIds: editableCategoryIds
        });

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

const setSelectedCardIds = (cardIds, value) => ({
    type: SET_SELECTED_CARD_IDS,
    cardIds: cardIds,
    value: value
})

const toggleEditOnCategoryIds = (categoryIds) => ({
    type: TOGGLE_EDIT_ON_CATEGORY_ID,
    categoryIds: categoryIds
})

export {
    reducer as default,
    initialState as decksInitialState,
    setGenerateImages,
    unsetGenerateImages,
    setShouldGenerateImagesWasSet,
    setSelectedCardIds,
    toggleEditOnCategoryIds,
};
