import PropTypes from 'prop-types';
import React from 'react';
import DeckComponent from '../../components/cambrian/deck-component.jsx'
import errorBoundaryHOC from '../../lib/error-boundary-hoc.jsx';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import bindAll from 'lodash.bindall';

class Deck extends React.Component {
    constructor(props) {
        super(props);
          bindAll(this, [
              'handleAddCard',
              'handleDeleteCard'
          ]);
          this.state = {
            deck: {
              cards: [
                { id: "card-t-rex", name: "T-Rex", size: 4, height: 4, strength: 4, image: "https://ddd" },
                { id: "card-stegasaurus", name: "Stegasaurus", size: 4, height: 4, strength: 4, image: "https://ddd" },
                { id: "card-triceraptors", name: "Triceraptors", size: 4, height: 4, strength: 4, image: "https://ddd" },
              ]
            }
          }
    }

    handleAddCard (name) {
        name = new Date().getTime().toString()
        const newCard = { id: `card-${name}`, name: `card-${name}`, size: 4, height: 4, strength: 4, image: "https://ddd" }
        this.setState({ deck: { cards: [...this.state.deck.cards, newCard] } } );
    }

    handleDeleteCard(event) {
        const newCards = this.state.deck.cards.filter(card=> {
          return card.name != event.target.value
        })

        this.setState({ deck: { cards: newCards }})
    }

    render () {
        return (
            <DeckComponent
                deck={this.state.deck}
                onDeleteCard={this.handleDeleteCard}
                onAddCard={this.handleAddCard}
              />
        )
    }
}

Deck.propTypes = {
};

const mapStateToProps = state => ({
});


const mapDispatchToProps = dispatch => ({
});

export default errorBoundaryHOC('Deck')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(Deck))
);
