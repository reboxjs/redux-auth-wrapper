import React, { useState } from "react";
import PropTypes from "prop-types";
import hoistStatics from "hoist-non-react-statics";
import { useNavigation, useRoute } from "@react-navigation/native";

const defaults = {
  AuthenticatingComponent: () => null, // dont render anything while authenticating
  FailureComponent: () => null, // dont render anything on failure of the predicate
  wrapperDisplayName: "AuthWrapper",
};

export default (args) => {
  const {
    AuthenticatingComponent,
    FailureComponent,
    wrapperDisplayName,
    LoadingComponent,
  } = {
    ...defaults,
    ...args,
  };

  // Wraps the component that needs the auth enforcement
  function wrapComponent(DecoratedComponent) {
    const displayName =
      DecoratedComponent.displayName || DecoratedComponent.name || "Component";

    const UserAuthWrapper = (ownProps) => {
      const navigation = useNavigation();
      const route = useRoute();
      const params = route.params;
      const [loading, setLoading] = useState(true);
      const authProps = {
        ...ownProps,
        params,
        replace: (path) => navigation.navigate(path, { replace: true }),
      };
      const {
        isAuthenticated,
        isAuthenticating,
        preAuthAction,
        replace,
        redirectPath,
        ...props
      } = authProps;

      React.useEffect(() => {
        if (loading) {
          if (preAuthAction) {
            preAuthAction();
          }
          setLoading(false);
        }
      }, []);

      if (loading) {
        /**
         * If loading component is not provided then render the authenticating component as a fallback, Since mostly
         * authenticating component will be a loader or a spinner.
         */
        return (
          <React.Fragment>
            {LoadingComponent ? (
              <LoadingComponent />
            ) : (
              <AuthenticatingComponent {...props} />
            )}
          </React.Fragment>
        );
      } else if (isAuthenticated) {
        return <DecoratedComponent {...props} />;
      } else if (isAuthenticating) {
        return <AuthenticatingComponent {...props} />;
      } else {
        return <FailureComponent {...authProps} />;
      }
    };

    UserAuthWrapper.displayName = `${wrapperDisplayName}(${displayName})`;
    UserAuthWrapper.propTypes = {
      isAuthenticated: PropTypes.bool,
      isAuthenticating: PropTypes.bool,
    };
    UserAuthWrapper.defaultProps = {
      isAuthenticating: false,
    };

    return hoistStatics(UserAuthWrapper, DecoratedComponent);
  }

  return wrapComponent;
};
