import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Checkout from './components/checkout/Checkout.js'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to='/payment'>Checkout</Link>
        </nav>

        <Switch>
          <Route path='/payment'>
            <Checkout/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
