import React, {useReducer} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Shelterly from './Shelterly';
import * as serviceWorker from './serviceWorker';
import {A} from "hookrouter";
import logo from "./static/images/nvadg_logo.png"
import auth_reducer, {initialState, CounterContext} from "./accounts/AccountsReducer";

const header_style = {
  textAlign: "center",
};

function CounterProvider(props) {
  const [state, dispatch] = useReducer(auth_reducer, initialState);
return (
   <CounterContext.Provider value={{ state, dispatch }}>
      {props.children}
    </CounterContext.Provider>
  );
}

// const token = localStorage.getItem('token');
// if (token) {
//   console.log(token);
// }

ReactDOM.render(
  <CounterProvider>
  <h1 style={header_style} className="col-12">
    <A href="/"><img src={logo} alt=""/></A>
  </h1>
  <hr className="mt-0 mb-4"/>
  <Shelterly />
</CounterProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
