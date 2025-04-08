import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, user } = useAuth();
  
  console.log('PrivateRoute: isAuthenticated =', isAuthenticated);
  console.log('PrivateRoute: user =', user);
  console.log('PrivateRoute: path =', rest.path);

  return (
    <Route
      {...rest}
      render={(props) => {
        console.log('PrivateRoute render: isAuthenticated =', isAuthenticated);
        console.log('PrivateRoute render: location =', props.location);
        
        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        );
      }}
    />
  );
};
