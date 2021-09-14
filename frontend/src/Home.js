import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import LoginForm from "./accounts/LoginForm";
import { useCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import Header from './components/Header';

function Home() {

  // Initial state.
  const { state } = useContext(AuthContext);
  const [cookies] = useCookies(['token']);

  const [data, setData] = useState({days: [], isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      setData({days: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          console.log(response.data)
          setData({days: response.data[0].days, isFetching: false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({days: [], isFetching: false});
        }
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  const columns = [
    {
        name: 'ID',
        selector: row => row.date,
    },
    {
        name: 'New SRs',
        selector: row => row.new_srs,
    },
];


  return (
    <>
    {!state.user && !cookies.token ? <LoginForm /> :
    <span>
      <Header>Home</Header>
      <hr/>
      <h3>Welcome to Shelterly!</h3>
      <DataTable
            columns={columns}
            data={data.days}
        />
    </span>
    }
    </>
  );
}

export default Home;
