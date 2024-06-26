import * as React from 'react'
import { connect } from 'react-redux'
import invariant from 'invariant'

import authWrapper from '../authWrapper.js'
import Redirect from '../redirect.js'

const connectedDefaults = {
  authenticatingSelector: () => false,
  allowRedirectBack: true,
  FailureComponent: Redirect,
  redirectQueryParamName: 'redirect'
}

export default ({ locationHelperBuilder, getRouterRedirect }) => {

  const connectedRouterRedirect = (args) => {
    const allArgs = { ...connectedDefaults, ...args }
    const { FailureComponent, redirectPath, authenticatedSelector, authenticatingSelector, allowRedirectBack, redirectQueryParamName, preAuthAction } = allArgs

    const { createRedirectLoc } = locationHelperBuilder({
      redirectQueryParamName
    })

    let redirectPathSelector
    if (typeof redirectPath === 'string') {
      redirectPathSelector = () => redirectPath
    } else if (typeof redirectPath === 'function') {
      redirectPathSelector = redirectPath
    } else {
      invariant(false, 'redirectPath must be either a string or a function')
    }

    let allowRedirectBackFn
    if (typeof allowRedirectBack === 'boolean') {
      allowRedirectBackFn = () => allowRedirectBack
    } else if (typeof allowRedirectBack === 'function') {
      allowRedirectBackFn = allowRedirectBack
    } else {
      invariant(false, 'allowRedirectBack must be either a boolean or a function')
    }

    const redirect = (replace) => (props, path) =>
      replace(createRedirectLoc(allowRedirectBackFn(props, path))(props, path))

    const ConnectedFailureComponent = connect((state, ownProps) => ({
      redirect: redirect(getRouterRedirect(ownProps))
    }))(FailureComponent)

    return (DecoratedComponent) => connect((state, ownProps) => ({
        redirectPath: redirectPathSelector(state, ownProps),
        isAuthenticated: authenticatedSelector(state, ownProps),
        isAuthenticating: authenticatingSelector(state, ownProps)
      }), (dispatch) => ({
        preAuthAction: () => {
          if (preAuthAction) {
            dispatch(preAuthAction())
          }
        }
      }))(authWrapper({ ...allArgs, FailureComponent: ConnectedFailureComponent })(DecoratedComponent))
  }

  const connectedReduxRedirect = (args) => {
    const allArgs = { ...connectedDefaults, ...args }
    const { FailureComponent, redirectPath, authenticatedSelector, authenticatingSelector, allowRedirectBack, redirectAction, redirectQueryParamName, preAuthAction } = allArgs

    const { createRedirectLoc } = locationHelperBuilder({
      redirectQueryParamName
    })

    let redirectPathSelector
    if (typeof redirectPath === 'string') {
      redirectPathSelector = () => redirectPath
    } else if (typeof redirectPath === 'function') {
      redirectPathSelector = redirectPath
    } else {
      invariant(false, 'redirectPath must be either a string or a function')
    }

    let allowRedirectBackFn
    if (typeof allowRedirectBack === 'boolean') {
      allowRedirectBackFn = () => allowRedirectBack
    } else if (typeof allowRedirectBack === 'function') {
      allowRedirectBackFn = allowRedirectBack
    } else {
      invariant(false, 'allowRedirectBack must be either a boolean or a function')
    }

    const createRedirect = (dispatch) => ({
      redirect: (props, path) => dispatch(redirectAction(createRedirectLoc(allowRedirectBackFn(props, path))(props, path)))
    })

    const ConnectedFailureComponent = connect(null, createRedirect)(FailureComponent)

    return (DecoratedComponent) =>
      connect((state, ownProps) => ({
        redirectPath: redirectPathSelector(state, ownProps),
        isAuthenticated: authenticatedSelector(state, ownProps),
        isAuthenticating: authenticatingSelector(state, ownProps),
      }), (dispatch) => ({
        preAuthAction: () => {
          if (preAuthAction) {
            dispatch(preAuthAction())
          }
        }
      }))(authWrapper({ ...allArgs, FailureComponent: ConnectedFailureComponent })(DecoratedComponent))
  }

  return {
    connectedRouterRedirect,
    connectedReduxRedirect
  }
}
