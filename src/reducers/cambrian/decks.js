const SET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/SET_GENERATE_IMAGES';
const UNSET_GENERATE_IMAGES = 'scratch-gui/cambrian/decks/UNSET_GENERATE_IMAGES';
const SET_SHOULD_GENERATE_IMAGES_WAS_SET = 'scratch-gui/cambrian/decks/SET_SHOULD_GENERATE_IMAGES_WAS_SET';
const SET_SELECTED_CARD_IDS = 'scratch-gui/cambrian/decks/SET_SELECTED_CARD_IDS';
const SET_DECK_SYNCED_WITH_COSTUMES = 'scratch-gui/cambrian/decks/SET_DECK_SYNCED_WITH_COSTUMES';

const initialState = {
    shouldGenerateImages: false,
    selectedCardIds: [],
    editableCategoryIds: {},
    deckSyncedWithCostumes: false
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

    case SET_DECK_SYNCED_WITH_COSTUMES:
        return Object.assign({}, state, {
            deckSyncedWithCostumes: action.value
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

const setSelectedCardIds = (cardIds, value) => ({
    type: SET_SELECTED_CARD_IDS,
    cardIds: cardIds,
    value: value
})

/**
 * Mark if the deck and the costumes are synced. Information goes from deck to costumes
 * After they are in sync probably there is no need to sync them again. This is an easy solution
 * until there is more requirement for a smarted sync of costumes with decks
 */
const setDeckSyncedWithCostumes = (value) => ({
    type: SET_DECK_SYNCED_WITH_COSTUMES,
    value: value
})

export {
    reducer as default,
    initialState as decksInitialState,
    setGenerateImages,
    unsetGenerateImages,
    setShouldGenerateImagesWasSet,
    setSelectedCardIds,
    setDeckSyncedWithCostumes
};
