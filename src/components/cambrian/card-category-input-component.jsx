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
        this.state = { categoryValue: this.props.categoryValue }
    }

    componentDidMount() {

    }

    handleChangeCardCategoryValue(event) {
      console.log("handleChangeCardCategoryValue")
      const value = event.target.value;
      this.setState({
          ...this.state,
          categoryValue: {
            ...this.state.categoryValue,
            value: value
          }
      });
    }

    render() {
        const {
          categoryId,
          cardId,
          onUpdateCardCategoryValue
        } = this.props;

        const categoryValue = this.state.categoryValue;

        const parsedValue = parseInt(categoryValue?.value,10);
        const value = isNaN(parsedValue) ? "" : parsedValue;
        return (<td key={`${categoryId}-${cardId}`}>
                  <input value={value}
                    className="block mx-auto w-8/12 text-center rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-8"
                    id={`categoryValue-${categoryValue?.id}`}
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
    categoryValue: PropTypes.number
};

export default CardCategoryInputComponent;