import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import VM from 'scratch-vm';

/* Higher Order Component to create the Cambrian object in the VM
 * We need this to communicate the projectId and deckHost between the editor and
 * the runtime. When running the game we have access only on the runtime
 * in the extension.
 *
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with cambrian behavior
 */
const CambrianHOC = function (WrappedComponent) {
    class CambrianComponent extends React.Component {
        constructor (props) {
            super(props);
        }

        componentDidMount () {
          // left empty to debug easier
        }

        componentDidUpdate (prevProps) {
            this.props.vm.runtime.cambrian = {
              // ...this.props.vm.runtime.cambrian,
              projectId: this.props.projectId,
              decksHost: this.props.decksHost
            }
        }

        render () {
            return (
                <WrappedComponent
                    {...this.props}
                />
            );
        }
    }
    CambrianComponent.propTypes = {
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        decksHost: PropTypes.string,
        vm: PropTypes.instanceOf(VM)
    };
    const mapStateToProps = state => {
        return {
            projectId: state.scratchGui.projectState.projectId,
            vm: state.scratchGui.vm
        };
    };
    const mapDispatchToProps = dispatch => ({});

    return connect(
        mapStateToProps,
        mapDispatchToProps,
    )(CambrianComponent);
};

export {
    CambrianHOC as default
};