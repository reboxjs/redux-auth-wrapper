import { connect } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import authWrapper from './authWrapper.js';


const connectedDefaults = {
  authenticatingSelector: () => false
}

export default (args) => {
  const { authenticatedSelector, authenticatingSelector, preAuthAction} = {
    ...connectedDefaults,
    ...args
  }

  return (DecoratedComponent) => {
    const ResultantComponent = (props) => {
      const Component = authWrapper(args)(DecoratedComponent);
      return (
        <BrowserRouter>
          <Component {...props} />
        </BrowserRouter>
      )
    }

    return connect((state, ownProps) => ({
      isAuthenticated: authenticatedSelector(state, ownProps),
      isAuthenticating: authenticatingSelector(state, ownProps)
    }), (dispatch) => ({
      preAuthAction: () => {
        if (preAuthAction) {
          dispatch(preAuthAction())
        }
      }
    }))(ResultantComponent)
  }
    
}
