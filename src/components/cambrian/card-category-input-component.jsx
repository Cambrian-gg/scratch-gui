import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';

class CardCategoryInputComponent extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this, [
            'handleChangeCardCategoryValue',
            ]
        )
        this.state = {}
        this.state = { inputValue: this.props.inputValue }
    }

    componentDidUpdate(prevProps) {
      if(this.props.inputValue != prevProps.inputValue) {
        this.setState({
            ...this.state,
            inputValue: this.props.inputValue
        });
      }
    }

    handleChangeCardCategoryValue(event) {
      console.log("handleChangeCardCategoryValue")
      const value = event.target.value;
      this.setState({
          ...this.state,
          inputValue: value
      });
    }

    render() {
        const {
          categoryId,
          cardId,
          onUpdateCardCategoryValue
        } = this.props;

        const inputValue = this.state.inputValue;

        const parsedValue = parseInt(inputValue,10);
        const value = isNaN(parsedValue) ? "" : parsedValue;
        const id = `${categoryId}-${cardId}`
        return (<td key={id}>
                  <input value={value}
                    className="block mx-auto w-8/12 text-center rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                    id={id}
                    data-category-id={categoryId}
                    data-card-id={cardId}
                    onChange={this.handleChangeCardCategoryValue}
                    onBlur={onUpdateCardCategoryValue}>
                  </input>
             </td>);
    }
}

CardCategoryInputComponent.propTypes = {
    onUpdateCardCategoryValue: PropTypes.func,
    categoryId: PropTypes.number,
    cardId: PropTypes.number,
    inputValue: PropTypes.number
};

export default CardCategoryInputComponent;