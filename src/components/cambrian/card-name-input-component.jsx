import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';

class CardNameInputComponent extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this, [
            'handleChangeCardName',
            ]
        )
        this.state = {}
        this.state = { cardName: this.props.cardName }
    }

    handleChangeCardName(event) {
      const value = event.target.value;
      this.setState({
          ...this.state,
          cardName: value
      });
    }

    render() {
        const {
          cardId,
          onUpdateCardName
        } = this.props;

        const cardName = this.state.cardName;

        return (
              <input
                  style={{ minWidth: "8rem" }}
                  className="block mx-auto w-full pl-2 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                  onChange={this.handleChangeCardName}
                  onBlur={onUpdateCardName}
                  value={cardName}
                  data-card-id={cardId}
                  >
              </input>
        )
    }
}

CardNameInputComponent.propTypes = {
    onUpdateCardName: PropTypes.func,
    cardId: PropTypes.number,
    cardName: PropTypes.string
};

export default CardNameInputComponent;