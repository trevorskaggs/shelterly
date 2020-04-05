import React, {useEffect, useState} from 'react';
import axios from "axios";
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const style = {
    textAlign: "center",
};

function CellFormatter(cell) {
    return (<div><a href={"/evac/evacteam/"+cell+"/"}>Evac Team {cell}</a></div>);
}

const columns = [
    {
        dataField: 'id',
        text: 'Evac Team',
        formatter:CellFormatter
    }, 
    {
        dataField: 'evac_team_member_names',
        text: 'Team Members'
    },
]

export function EvacTeamTable() {
    const [data, setData] = useState({evac_teams: [], isFetching: false});

    useEffect(() => {
        const fetchEvacTeams = async () => {
            try {
                setData({evac_teams: data.evac_teams, isFetching: true});
                const response = await axios.get('http://localhost:8000/evac/api/evacteam/');
                console.log(response.data);
                setData({evac_teams: response.data, isFetching: false});
            } catch (e) {
                console.log(e);
                setData({evac_teams: data.evac_teams, isFetching: false});
            }
        };
        fetchEvacTeams();
    }, []);

    return (
        <div>
            <h1 style={style}>Evac Teams</h1>
            <br/>
            <BootstrapTable keyField='id' data={ data.evac_teams } columns={columns}/>
            <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
        </div>
    )
}
