import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ReduxToastr from 'react-redux-toastr';
import { Helmet } from 'react-helmet';
import { Switch, Route } from 'react-router-dom';

import Home from 'containers/Home';

import 'styles/containers/app.css';

export default function App() {
  return (
    <MuiThemeProvider>
      <div className="app">
        <Helmet>
          <meta name="description" content="Simple Clarifai Demo" />
          <title>Clarifai Test - Simple Clarifai Challenge</title>
        </Helmet>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="" component={Home} />
        </Switch>
        <ReduxToastr
          timeOut={5000}
          newestOnTop={true}
          preventDuplicates
          position="top-right"
          transitionIn="bounceIn"
          transitionOut="bounceOut"
          progressBar={false} />
      </div>
    </MuiThemeProvider>
  );
}
