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
} from '../../reducers/cambrian/decks';

import {costumeUpload} from '../../lib/file-uploader.js';
import VM from 'scratch-vm';

class Deck extends React.Component {
    constructor(props) {
        super(props);
          bindAll(this, [
              'handleCreateCard',
              'handleDeleteCard',
              'handleChangeCard',
              'handleUpdateCard',
              'handleChangeCategory',
              'handleChangeCategoryValue',
              'handleCreateDeck',
              'handleUpdateDeck',
              'handleChangeDeck',
              'handleCreateCardAiGeneration',
              'handleCreateCardAiGenerationForAll',
              'handleGenerateImagesChanged',
          ]);
          this.state = {}
    }

    componentDidMount() {
       const {
          vm
        } = this.props;
        // Brute force sync them all. We sync names, pictures
        // and position. We will upload them all back to the server
        // and make post request. But doing it smarter requires a
        // much smarter API of what changed with the card, when and
        // how, in order to chagne only what changed.
        // One of the things is the url of the pictures. This url
        // contains a signature and this signature is different
        // each time so we can not such compare the url of the image
        // and decide if we should change the image.
        //
        // It will take about a day to figure how to do it in smart way here

        // this.createCardInCostumes(card);
        //
        // We first delete all the costumes and then crete the new ones
        // to avoid indexOf issues that occur when reordering the cards
        // in the createCardInCostumes
        this.loadDeckFromServer().then(()=> {
            return this.emptyCostumes()
        }).then(()=> {
            return this.recreateCostumesFromCards();
        }).then(()=> {
            return this.reorderCostumeBasedOnCards();
        })
    }

    componentDidUpdate() {
        console.log("componentDidUpdate")
    }


    emptyCostumes() {
        const deck = this.state.deck;
        deck.cards.forEach((card)=> {
          this.deleteCardFromCostumes(card.id);
        })
        return deck;
    }

    recreateCostumesFromCards() {
        const deck = this.state.deck;
        const allCreatePromises = deck.cards.map((card)=> {
          return this.createCardInCostumes(card)
        })
        return Promise.all(allCreatePromises)
    }

    reorderCostumeBasedOnCards() {
        const {
          vm
        } = this.props;
        // now we reorder them as the creates were in a promise
        const deck = this.state.deck;
        for(let i = 0; i < deck.cards.length; i++) {
          const card = deck.cards[i]
          const currentCostumeIndex = vm.editingTarget.getCostumes().findIndex(c=> c.name.startsWith(`card-${card.id}-`))
          const newCostumeIndex = i;
          vm.editingTarget.reorderCostume(currentCostumeIndex, i)
        }
    }

    loadDeckFromServer() {
        const {
          decksHost,
          projectToken,
          projectId
        } = this.props;
        const promise = new Promise((resolve, reject) => {
          xhr({
              method: 'GET',
              uri: `${decksHost}/decks?project_id=${projectId}`,
              headers: {
                "Content-Type": 'application/json',
                'Authorization': `Bearer ${projectToken}`
              },
              json: true
          }, (error, response) => {

              if (error || response.statusCode !== 200) {
                  this.setState(
                      {
                          ...this.state,
                          deck: undefined
                      }
                  )
                  return reject(new Error(response.status));
              }
              const lastDeck = response.body[response.body.length-1]
              if(lastDeck) {
                const deck =  {
                          cards: [],
                          ...lastDeck
                        }
                this.setState(
                    {
                        ...this.state,
                        deck: deck

                    }
                ) // take the first one as we know only how to handle the first one.
                resolve(deck)
              }
          })
        })
        return Promise.all([promise])
    }

    handleCreateCard (name) {
        this.createCardOnServer(name).then((newCard)=> {
          return this.createCardInDeckComponent(newCard)
        }).then((newCard) => {
          return this.createCardInCostumes(newCard)
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

        const deckId = this.state.deck.id;

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
                resolve(newCard);
              }
          })
        })
        return promise;
    }

    createCardInDeckComponent(newCard) {
        return new Promise((resolve, reject)=>{
            const deck = this.state.deck;
            this.setState(
                {
                    deck: {
                      ...deck,
                      cards: [...deck.cards, newCard]
                    }
                }
            )
            resolve(newCard);
        });
    }

    /**
     * Creates a costume based on the card.
     *
     * @return a promise that will resovle when the card is create. Resolve with the costume as param
     */
    createCardInCostumes(card) {
        const url = card.imageUrl;
        const storage = this.props.vm.runtime.storage;
        const vm = this.props.vm;
        // We need to return a promise to resolve after adding the costume
        // Otherwise we don't know when this addition will happen
        // We want the whole method to resolve then.
        return new Promise((resolve, reject)=> {
            fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Network response was not OK');
                }
                return response.blob();
              }).then((blob) => {
                return new Promise((resolveFileReader, reject) => {
                    const fileReader = new FileReader();
                    fileReader.onload = () => resolveFileReader(fileReader.result);
                    fileReader.readAsDataURL(blob);
                });
              }).then((data)=> {
                  costumeUpload(data,"image/png", storage, vmCostumes => {
                      vmCostumes.forEach((costume, i) => {
                          costume.name = `card-${card.id}-${card.name}`;
                      });
                      this.addCostume(vmCostumes, false, null).then(() => {
                          const costume = vmCostumes[0];
                          const index = this.props.vm.editingTarget.getCostumes().indexOf(costume)
                          const newIndex = this.state.deck.cards.indexOf(card)
                          vm.editingTarget.reorderCostume(index, newIndex)
                          resolve(costume)
                      });
                  },()=>{
                    console.log("here")
                  })
              }).catch((error) => {
                console.error('There has been a problem with your fetch operation:', error);
              });
        })
    }

    handleDeleteCard(event) {
        const cardId = event.target.value;
        const deleteFromServerPromise = this.deleteCardFromServer(cardId)
        deleteFromServerPromise.then(() => {
          this.deleteCardFromDeckComponent(cardId)
        }).then(() => {
          this.deleteCardFromCostumes(cardId);
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

    deleteCardFromCostumes(cardId) {
        const {
            vm
        } = this.props;

        const costumes = vm.editingTarget.sprite.costumes_.filter(costume=> costume.name.startsWith(`card-${cardId}-`))
        costumes.forEach(costume => {
          const index = vm.editingTarget.sprite.costumes_.indexOf(costume)
          vm.editingTarget.deleteCostume(index);
        })
    }

    deleteCardFromDeckComponent(cardId) {
        const newCards = this.state.deck.cards.filter(card=> {
          return card.id != cardId
        })

        const deck = this.state.deck;

        this.setState(
            {
                deck: {
                  ...deck,
                  cards: newCards
                }
            }
        )
    }

    handleChangeCard(event) {
        const cardId = event.target.parentElement.parentElement.id.split("-")[1]
        const deck = this.state.deck;
        const card = this.getCardWithId(cardId)
        card.name = event.target.value
        this.setState({
          ...this.state,
          deck: deck
        })
    }

    handleUpdateCard(event) {
        const cardId = event.target.parentElement.parentElement.id.split("-")[1]
        const deck = this.state.deck;
        const card = this.getCardWithId(cardId)
        // don't update a specific card. Update the whole deck on the server
        this.updateDeckOnServer().then(()=> {
          // This update happens only if we change categories or names
          // The image could change only from the server
          this.updateCostumeNameFromCard(card)
        })
    }

    updateCostumeNameFromCard(card) {
        // I should find a way to do this only if the name has changed.
        // Not to do it on every change.
        // This comes later when we have a "change API"
        const {
          vm
        } = this.props;

        const costume = vm.editingTarget.getCostumes().filter(c=> c.name.startsWith(`card-${card.id}-`))[0]
        if(costume) {
          costume.name = `card-${card.id}-${card.name}`
        }
    }

    getCardWithId(cardId) {
        return this.state.deck.cards.filter((card)=> {
            return card.id == cardId
        })[0]
    }

    handleChangeCategory(event) {
      const categoryId = event.target.id.split("-")[1]
      const deck = this.state.deck;
      const category = deck.categories.filter(({ id}) => id == categoryId )[0];
      category.name = event.target.value;
      this.setState({
        ...this.state,
        deck: deck
      })
    }

    handleChangeCategoryValue(event) {
      const cardId = event.target.dataset.cardId
      const categoryId = event.target.dataset.categoryId
      const categoryValueId = event.target.id.split("-")[1];

      const deck = this.state.deck;
      const card = deck.cards.filter(({ id }) => id == cardId)[0];

      const categoryValue = card.categoryValues.filter((categoryValue) => categoryValue.cardId == cardId && categoryValue.categoryId == categoryId)[0];
      if (categoryValue !== undefined){
        categoryValue.value = event.target.value;
      } else {
        card.categoryValues.push({value: event.target.value, categoryId: categoryId, cardId: cardId})
      }

      this.setState({
        ...this.state,
        deck: deck
      })
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
                return resolve(response.body, decksHost);
            });
        });
    }

    handleCreateCardAiGenerationForAll(event) {
        return this.state.deck.cards.map(card=> this.createCardAiGeneration(card.id))
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
                    "project_id": projectId
                  }
                })
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                const deck = JSON.parse(response.body)
                this.setState({
                  deck: {
                    cards: [],
                    ...deck
                  }
                })
            });
        });
        Promise.all([promise])
    }

    handleChangeDeck(event) {
      const deckName = event.target.value;
      this.setState({
        ...this.state,
        deck: {
          ...this.state.deck,
          name: deckName
        }
      })
    }

    handleUpdateDeck() {
        this.updateDeckOnServer()
    }

    updateDeckOnServer() {
        const deck = Object.assign({}, this.state.deck);
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
                  }
                })
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, decksHost);
            });
        });
        return Promise.all([promise])
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
                deck={this.state.deck}
                onCreateCard={this.handleCreateCard}
                onChangeCard={this.handleChangeCard}
                onDeleteCard={this.handleDeleteCard}
                onUpdateCard={this.handleUpdateCard}
                onChangeCategory={this.handleChangeCategory}
                OnChangeCategoryValue={this.handleChangeCategoryValue}
                onCreateDeck={this.handleCreateDeck}
                onUpdateDeck={this.handleUpdateDeck}
                onChangeDeck={this.handleChangeDeck}
                onCreateCardAiGeneration={this.handleCreateCardAiGeneration}
                isGenerateImagesSelected={this.props.shouldGenerateImages}
                onGenerateImagesChanged={this.handleGenerateImagesChanged}
                onAutocompleteAll={this.handleCreateCardAiGenerationForAll}
              />
        )

    }
}

Deck.propTypes = {
  decksHost: PropTypes.string,
  projectToken: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  shouldGenerateImages: PropTypes.bool,
  vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = (state, ownProps) => {
  return {
    shouldGenerateImages: state.scratchGui.decks.shouldGenerateImages
  };
};

const mapDispatchToProps = dispatch => ({
  onSetGenerateImages: () => dispatch(setGenerateImages()),
  onUnsetGenerateImages: () => dispatch(unsetGenerateImages())
});

export default errorBoundaryHOC('Deck')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(Deck))
);
