import React from "react";
import { A } from "hookrouter";
import {EvacTeamForm, TeamMemberForm} from "./EvacForm";
import {EvacTeamTable} from "./EvacTables";


const link_style = {
    textDecoration: "none",
};

const btn_style = {
    width: "50%",
    margin: "0 auto",
};

const Evac = () => (
    <div style={btn_style}>
        <A href="/evac/evacteam/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW EVAC TEAM</A>
        <A href="/evac/evacteam/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM LIST</A>
        <A href="" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">DEPLOY EVAC TEAM</A>
        <A href="" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM DEBRIEF</A>
        <A href="/evac/teammember/new" style={link_style} className="btn btn-warning btn-lg btn-block">ADD TEAM MEMBER</A>
        <br/>
        <br/>
        <A className="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
    </div>
)

export const NewTeam = () => (
    <div>
        <EvacTeamForm />
    </div>
)

export const TeamList = () => (
    <div>
        <EvacTeamTable />
    </div>
)

export const NewTeamMember = () => (
    <div>
        <TeamMemberForm />
    </div>
)

export default Evac
