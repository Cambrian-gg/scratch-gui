import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';

class CategoryInputComponent extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this, [
            'handleChangeCategoryValue',
            ]
        )
        this.state = {}
        this.state = { categoryName: this.props.categoryName }
    }

    handleChangeCategoryValue(event) {
      console.log("handleChangeCategoryValue")
      const value = event.target.value;
      this.setState({
          ...this.state,
          categoryName: value
      });
    }

    render() {
        const {
          categoryId,
          onUpdateCategory
        } = this.props;

        const categoryName = this.state.categoryName;

        return (
          <div className="min-w-max mt-2 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"></path>
              </svg>
            </span>
            <input
              className="text-center block w-32 flex-1 rounded-none rounded-r-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={this.handleChangeCategoryValue}
              onBlur={onUpdateCategory}
              data-category-id={categoryId}
              value={categoryName}>
            </input>
          </div>
        )
    }
}

CategoryInputComponent.propTypes = {
    onUpdateCategory: PropTypes.func,
    categoryId: PropTypes.number,
    categoryName: PropTypes.string
};

export default CategoryInputComponent;