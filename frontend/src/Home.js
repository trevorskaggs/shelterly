import React, { useContext } from "react";
import LoginForm from "./accounts/LoginForm";
import { useCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';

function Home() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  return (
    <>
    {!state.user && !cookies.token ? <LoginForm /> :
    <span>
      <Header>Home</Header>
      <hr/>
      <h3>Welcome to Shelterly!</h3>
    </span>
    }
    </>
  );
}

export default Home;
