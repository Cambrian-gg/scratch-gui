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

class Deck extends React.Component {
    constructor(props) {
        super(props);
          bindAll(this, [
              'handleCreateCard',
              'handleChangeCard',
              'handleDeleteCard',
              'handleChangeCategory',
              'handleChangeCategoryValue',
              'handleCreateDeck',
              'handleUpdateDeck',
              'handleChangeDeck',
              'handleCreateCardAiGeneration',
              'handleGenerateImagesChanged',
          ]);
          this.state = {
            // deck: {
            //   cards: [
            //     { id: "card-t-rex", name: "T-Rex", size: 4, height: 4, strength: 4, image: "https://ddd" },
            //     { id: "card-stegasaurus", name: "Stegasaurus", size: 4, height: 4, strength: 4, image: "https://ddd" },
            //     { id: "card-triceraptors", name: "Triceraptors", size: 4, height: 4, strength: 4, image: "https://ddd" },
            //   ]
            // }
          }
    }

    componentDidMount() {
        const {
          host,
          token,
          projectId
        } = this.props;
        const promise = new Promise((resolve, reject) => {
          xhr({
              method: 'GET',
              uri: `${host}/scratch/decks?project_id=${projectId}`,
              headers: {
                "Content-Type": 'application/json',
                'Authorization': `Bearer ${token}`
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
                this.setState(
                    {
                        ...this.state,
                        deck: {
                          cards: [],
                          ...lastDeck
                        }
                    }
                ) // take the first one as we know only how to handle the first one.
              }
          })
        })
        Promise.all([promise]).catch(() => {
          console.warn("error getting a deck")
        })
    }

    handleCreateCard (name) {
        const {
          host,
          token
        } = this.props;

        const deckId = this.state.deck.id;

        const promise = new Promise((resolve, reject) => {
          xhr({
            method: 'POST',
            uri: `${host}/scratch/cards`,
            headers: {
              "Content-Type": 'application/json',
              'Authorization': `Bearer ${token}`
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
                const deck = this.state.deck;
                this.setState(
                    {
                        deck: {
                          ...deck,
                          cards: [...deck.cards, newCard]
                        }
                    }
                )
              }
          })
       })
      Promise.all([promise])
    }

    handleChangeCard(event) {
        const cardId = event.target.parentElement.parentElement.id.split("-")[1]
        const deck = this.state.deck;
        const card = deck.cards.filter((card)=> {
            return card.id == cardId
        })[0]
        card.name = event.target.value
        this.setState({
          ...this.state,
          deck: deck
        })
    }

    handleDeleteCard(event) {
        const {
          host,
          token
        } = this.props;

        const cardId = event.target.value;

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'DELETE',
                uri: `${host}/scratch/cards/${cardId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                json: true
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, host);
            });
        });
        Promise.all([promise]).then(() => {
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
        })
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
        const {
          host,
          token
        } = this.props;

        const cardId = event.target.value;

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'POST',
                uri: `${host}/scratch/card_ai_generations/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: {
                    "card_ai_generation": {
                        "card_id" : cardId
                    }
                },
                json: true
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    return reject(new Error(response.status));
                }
                return resolve(response.body, host);
            });
        });
        Promise.all([promise]).then()
    }

    handleCreateDeck() {
        const {
          host,
          token,
          projectId
        } = this.props;

        if(projectId == null || projectId == undefined || projectId == 0) {
          alert("Please save the project first.")
          return;
        }

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'POST',
                uri: `${host}/scratch/decks/`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
        const {
          host,
          token
        } = this.props;

        const deck = Object.assign({}, this.state.deck);
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
          delete card.categoryValues;
          return newCard
        });

        const promise = new Promise((resolve, reject) => {
            xhr({
                method: 'PUT',
                uri: `${host}/scratch/decks/${deckId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
                return resolve(response.body, host);
            });
        });
        Promise.all([promise])
    }

    handleGenerateImagesChanged(event) {
      if(event.target.checked) {
        this.props.onSetGenerateImages();
      } else {
        this.props.onUnsetGenerateImages();
      }
    }

    render () {
        return (
            <DeckComponent
                deck={this.state.deck}
                onCreateCard={this.handleCreateCard}
                onChangeCard={this.handleChangeCard}
                onDeleteCard={this.handleDeleteCard}
                onChangeCategory={this.handleChangeCategory}
                OnChangeCategoryValue={this.handleChangeCategoryValue}
                onCreateDeck={this.handleCreateDeck}
                onUpdateDeck={this.handleUpdateDeck}
                onChangeDeck={this.handleChangeDeck}
                onCreateCardAiGeneration={this.handleCreateCardAiGeneration}
                isGenerateImagesSelected={this.props.shouldGenerateImages}
                onGenerateImagesChanged={this.handleGenerateImagesChanged}
              />
        )

    }
}

Deck.propTypes = {
  host: PropTypes.string,
  token: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  shouldGenerateImages: PropTypes.bool,
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
