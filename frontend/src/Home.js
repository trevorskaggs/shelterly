import React, { useContext } from "react";
import LoginForm from "./accounts/LoginForm";
import { useCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";

function Home() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  return (
    <>
    {!state.user && !cookies.token ? <LoginForm /> : <div></div>}
    </>
  );
}

export default Home;
