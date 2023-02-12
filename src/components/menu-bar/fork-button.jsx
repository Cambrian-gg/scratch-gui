import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../button/button.jsx';

import styles from './share-button.css';
import {connect} from 'react-redux';

class ForkButton extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
      const {
          className,
          isForked,
          onClick,
          projectId,
          projectHost
      } = this.props;

      return (
          <Button
              className={classNames(
                  className,
                  styles.shareButton,
                  {[styles.shareButtonIsShared]: isForked}
              )}
              onClick={()=> {
                // FIXME: This value should come from the redux state
                // Waiting for a good opportunity to abstract it. I probably will
                // wait to need it at one more place. For now it is ok
                const projectHost = "https://app.cambrian.gg"
                window.location.href=`${projectHost}/games/${projectId}`
              }}
          >
              {isForked ? (
                  <FormattedMessage
                      defaultMessage="Fork"
                      description="Label for forked project"
                      id="gui.menuBar.isForked"
                  />
              ) : (
                  <FormattedMessage
                      defaultMessage="Fork"
                      description="Label for project fork button"
                      id="gui.menuBar.fork"
                  />
              )}
          </Button>
          )
    }
};

ForkButton.propTypes = {
    className: PropTypes.string,
    isForked: PropTypes.bool,
    onClick: PropTypes.func,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const mapStateToProps = state => ({
    projectId: state.scratchGui.projectState.projectId
});

export default connect(
    mapStateToProps,
)(ForkButton);
