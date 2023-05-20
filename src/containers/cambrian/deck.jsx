import PropTypes from 'prop-types';
import React from 'react';
import DeckComponent from '../../components/cambrian/deck-component.jsx'
import errorBoundaryHOC from '../../lib/error-boundary-hoc.jsx';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import bindAll from 'lodash.bindall';
import xhr from 'xhr';
import {
    setGenerateImages,
    unsetGenerateImages,
    setShouldGenerateImagesWasSet,
    setSelectedCardIds,
    setDeck,
    setDeckSyncedWithCostumes,
} from '../../reducers/cambrian/decks';

import { createCardInCostumes } from "../../lib/cambrian/costumes-utilities.js";
import VM from 'scratch-vm';

class Deck extends React.Component {
    constructor(props) {
        super(props);
          bindAll(this, [
              'handleCreateCard',
              'handleDeleteCard',
              'handleSelectCard',
              'handleUpdateCardName',
              'handleUpdateCategory',
              'handleUpdateCardCategoryValue',
              'handleCreateDeck',
              'handleUpdateDeck',
              'handleChangeDeckName',
              'handleChangeCostumesSpriteName',
              'handleCreateCardAiGeneration',
              'handleCreateCardAiGenerationForSelected',
              'handleDeleteForSelected',
              'handleToggleSelectedForAll',
              'handleGenerateImagesChanged',
          ]);
          this.state = {}
    }

    componentDidMount() {
        // set it by default and remember that we've set it
        if(this.props.shouldGenerateImages==false && this.props.shouldGenerateImagesWasSet==undefined) {
          this.props.onSetGenerateImages()
          this.props.onSetShouldGeneratedImagesWasSet()
        }
    }

    componentDidUpdate() {
        console.log("Deck::componentDidUpdate")
    }

    handleCreateCard (name) {
        this.createCardOnServer(name).then((newCard)=> {
          return this.createCardInDeckComponent(newCard)
        }).then((newCard) => {
          return createCardInCostumes(newCard, this)
        })
    }

    /**
     * Get the name,and return the promise that resolves
     * when the card is create on the server.
     * Resolve with the 'card' response from the server
     */
    createCardOnServer(name) {
       const {
          decksHost,
          projectToken
        } = this.props;

        const deckId = this.props.deck.id;
        this.setState({...this.state, isLoading: true});

        const promise = new Promise((resolve, reject) => {
          xhr({
            method: 'POST',
            uri: `${decksHost}/cards`,
            headers: {
              "Content-Type": 'application/json',
              'Authorization': `Bearer ${projectToken}`
            },
            body: JSON.stringify({
              "card": {
                "deck_id": deckId,
              }
            })
          }, (error, response) => {
              if (error || response.statusCode !== 200) {
                  return reject(new Error(response.status));
              }
              if(response.body[0]) {
                const newCard = JSON.parse(response.body)
                this.setState({...this.state, isLoading: false});
                resolve(newCard);
              }
          })
        })
        return promise;
    }

    createCardInDeckComponent(newCard) {
        return new Promise((resolve, reject)=>{
            const deck = this.props.deck;
            this.props.setDeck({
                  ...deck,
                  cards: [...deck.cards, newCard]
                }
            )
            resolve(newCard);
        });
    }

    handleDeleteCard(event) {
        const cardId = event.target.value;
        this.deleteCard(cardId);
    }

    deleteCard(cardId){
      const deleteFromServerPromise = this.deleteCardFromServer(cardId);
      deleteFromServerPromise.then(() => {
        this.deleteCardFromDeckComponent(cardId)
      }).then(() => {
        this.setDeckSyncedWithCostumes(false)
      }).then(() => {
        this.props.onSetSelectedCardIds([+cardId], false)
      })
    }

    deleteCardFromServer(cardId) {
        const {
          decksHost,
          projectToken
        } = this.props;

        return new Promise((resolve, reject) => {
            xhr({
                method: 'DELETE',
                uri: `${decksHost}/cards/${cardId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${projectToken}`
                },
                json: true
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, decksHost);
            });
        });
    }

    deleteCardFromDeckComponent(cardId) {
        const newCards = this.props.deck.cards.filter(card=> {
          return card.id != cardId
        })

        const deck = this.props.deck;

        this.props.setDeck(
            {
                ...deck,
                cards: newCards
            }
        )
    }

    handleSelectCard(event) {
        const cardId = event.target.dataset.cardId;
        if (this.props.selectedCardIds.includes(+cardId)){
          this.props.onSetSelectedCardIds([+cardId], false);
        } else {
          this.props.onSetSelectedCardIds([+cardId], true);
        }
    }

    handleUpdateCardName(event) {
        const deck = this.props.deck
        const cardId = event.target.dataset.cardId;
        const card = deck.cards.filter((card)=> {
            return card.id == cardId;
        })[0]

        card.name = event.target.value;
        this.props.setDeck(deck);

        // don't update a specific card. Update the whole deck on the server
        this.updateDeckOnServer().catch(error => {
          console.log("Error: ", error)
        })
    }

    handleUpdateCategory(event) {
      const categoryId = event.target.dataset.categoryId;
      const deck = this.props.deck;
      const category = deck.categories.filter(({ id}) => id == categoryId )[0];
      category.name = event.target.value;
      this.props.setDeck(deck);
      this.updateDeckOnServer();
    }

    handleUpdateCardCategoryValue(event) {
      console.log("handleUpdateCardCategoryValue")
      const cardId = event.target.dataset.cardId;
      const categoryId = event.target.dataset.categoryId;

      const deck = this.props.deck;
      const card = deck.cards.filter(({ id }) => id == cardId)[0];

      const categoryValue = card.categoryValues.filter((categoryValue) => categoryValue.cardId == cardId && categoryValue.categoryId == categoryId)[0];
      if (categoryValue !== undefined){
        categoryValue.value = event.target.value;
      } else {
        card.categoryValues.push({value: event.target.value, categoryId: categoryId, cardId: cardId})
      }

      this.props.setDeck(deck);
      this.updateDeckOnServer();
    }

    handleCreateCardAiGeneration(event) {
        const cardId = event.target.value;

        this.createCardAiGeneration(cardId)
    }

    createCardAiGeneration(cardId) {
       const {
          decksHost,
          projectToken
        } = this.props;

        this.setState({...this.state, isLoading: true});
        return new Promise((resolve, reject) => {
            xhr({
                method: 'POST',
                uri: `${decksHost}/card_ai_generations/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${projectToken}`
                },
                body: {
                    "card_ai_generation": {
                        "card_id" : cardId,
                        "generate_images": this.props.shouldGenerateImages
                    }
                },
                json: true
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                const card = response.body
                const deck = this.props.deck;
                const index = deck.cards.findIndex(c=> c.id == card.id)
                deck.cards[index] = card
                this.props.setDeck(deck);
                this.setState({
                  ...this.state,
                  isLoading: false,
                })

                return resolve(response.body, decksHost);
            });
        });
    }

    handleCreateCardAiGenerationForSelected() {
      this.props.selectedCardIds.forEach(cardId => this.createCardAiGeneration(cardId));
    }

    handleDeleteForSelected() {
      this.props.selectedCardIds.forEach(cardId  => this.deleteCard(cardId));
    }

    handleToggleSelectedForAll(event) {
      const allCardIds = this.props.deck.cards.map(card => card.id);
      if (event.target.dataset.selectedValue == 'true'){
        this.props.onSetSelectedCardIds(allCardIds, true)
      } else {
        this.props.onSetSelectedCardIds(allCardIds, false)
      }
    }

    handleCreateDeck() {
        const {
          decksHost,
          projectToken,
          projectId
        } = this.props;

        if(projectId == null || projectId == undefined || projectId == 0) {
          alert("Please save the project first.")
          return;
        }

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'POST',
                uri: `${decksHost}/decks/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${projectToken}`
                },
                body: JSON.stringify({
                  "deck": {
                    "game_id": projectId
                  }
                })
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                const deck = JSON.parse(response.body)
                deck = {
                  cards: [],
                  ...deck
                }
                this.props.setDeck(deck)
            });
        });
        Promise.all([promise])
    }

    handleChangeDeckName(event) {
      const deckName = event.target.value;
      this.props.setDeck({
          ...this.props.deck,
          name: deckName
      })
    }

    handleChangeCostumesSpriteName(event) {
        const costumesSpriteName = event.target.value;
        this.props.setDeck({
          ...this.props.deck,
          costumesSpriteName: costumesSpriteName
        })
    }

    handleUpdateDeck() {
        this.updateDeckOnServer()
    }

    updateDeckOnServer() {
        const deck = Object.assign({}, this.props.deck);
        const {
          decksHost,
          projectToken
        } = this.props;

        const deckId = deck.id;

        // TODO mkirilov probably should change the structure not to do the map here, but the downside is that it should
        // be done somewhere
        const cardAttributes = deck.cards.map((card) => {
          const newCard = {
            categoryValuesAttributes: card.categoryValues,
            ...card
          }
          // Do not want to have categoryValues and categoryValuesAttributes, so I delete the unused.
          // We will get unremitted params
          delete newCard.categoryValues;
          return newCard
        });

        this.setState({...this.state, isLoading: true});
        this.props.setDeck(deck)
        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'PUT',
                uri: `${decksHost}/decks/${deckId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${projectToken}`
                },
                body: JSON.stringify({
                  "deck": {
                    // We expect them as cards_attributes in the API, not as cards
                    "cardsAttributes": cardAttributes ,
                    "categoriesAttributes": deck.categories,
                    "name": deck.name,
                    "costumesSpriteName": deck.costumesSpriteName
                  }
                })
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                // We need to update the deck with the deck from the response otherwise we will try to create category_value twice,
                // because we are not providing the ID. Have two category_values for the same card/category is not permitted, because it makes no sense.
                // This is the most Rails way I could think of. If we have problems with this update, we can implement on the Back End a way to distinguish
                // creating from updating category_values without providing category_value.id, but it will not follow the accept_nested_attribute rules.
                this.props.setDeck(JSON.parse(response.body))
                this.setState({...this.state, isLoading: false})
                this.props.setDeckSyncedWithCostumes(false)
                return resolve(response.body, decksHost);
            });
        });
        return Promise.all([promise]);
    }

    handleGenerateImagesChanged(event) {
        if(event.target.checked) {
          this.props.onSetGenerateImages();
        } else {
          this.props.onUnsetGenerateImages();
        }
    }

    addCostume (costume, targetId) {
        const costumes = Array.isArray(costume) ? costume : [costume];

        return Promise.all(costumes.map(c => {
            // If targetId is falsy, VM should default it to editingTarget.id
            // However, targetId should be provided to prevent #5876,
            // if making new costume takes a while
            return this.props.vm.addCostume(c.md5, c, targetId);
        }));
    }

    render () {
        return (
            <DeckComponent
                deck={this.props.deck}
                onCreateCard={this.handleCreateCard}
                onUpdateCardName={this.handleUpdateCardName}
                onSelectCard={this.handleSelectCard}
                onDeleteCard={this.handleDeleteCard}
                onUpdateCategory={this.handleUpdateCategory}
                onUpdateCardCategoryValue={this.handleUpdateCardCategoryValue}
                onCreateDeck={this.handleCreateDeck}
                onUpdateDeck={this.handleUpdateDeck}
                onChangeDeckName={this.handleChangeDeckName}
                onChangeCostumesSpriteName={this.handleChangeCostumesSpriteName}
                onCreateCardAiGeneration={this.handleCreateCardAiGeneration}
                isGenerateImagesSelected={this.props.shouldGenerateImages}
                onGenerateImagesChanged={this.handleGenerateImagesChanged}
                onAutocompleteSelected={this.handleCreateCardAiGenerationForSelected}
                onDeleteSelected={this.handleDeleteForSelected}
                onToggleSelectedForAll={this.handleToggleSelectedForAll}
                isLoading={this.state.isLoading}
                selectedCardIds={this.props.selectedCardIds}
              />
        )

    }
}

Deck.propTypes = {
  decksHost: PropTypes.string,
  projectToken: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  shouldGenerateImages: PropTypes.bool,
  shouldGenerateImagesWasSet: PropTypes.bool,
  selectedCardIds: PropTypes.arrayOf(PropTypes.number),
  vm: PropTypes.instanceOf(VM),
  deckSyncedWithCostumes: PropTypes.bool,
  deck: PropTypes.any,
};

const mapStateToProps = (state, ownProps) => {
  return {
    shouldGenerateImages: state.scratchGui.decks.shouldGenerateImages,
    shouldGenerateImagesWasSet: state.scratchGui.decks.shouldGenerateImagesWasSet,
    selectedCardIds: state.scratchGui.decks.selectedCardIds,
    deckSyncedWithCostumes: state.scratchGui.decks.deckSyncedWithCostumes,
    deck: state.scratchGui.decks.deck,
  };
};

const mapDispatchToProps = dispatch => ({
  onSetGenerateImages: () => dispatch(setGenerateImages()),
  onUnsetGenerateImages: () => dispatch(unsetGenerateImages()),
  onSetShouldGeneratedImagesWasSet: () => dispatch(setShouldGenerateImagesWasSet()),
  onSetSelectedCardIds: (cardIds, value) => dispatch(setSelectedCardIds(cardIds, value)),
  setDeck: deck => dispatch(setDeck(deck)),
  setDeckSyncedWithCostumes: (value) => dispatch(setDeckSyncedWithCostumes(value)),
});

export default errorBoundaryHOC('Deck')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(Deck))
);
