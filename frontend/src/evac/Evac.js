import React from "react";
import { A } from "hookrouter";

const link_style = {
    textDecoration: "none",
};

const btn_style = {
    width: "50%",
    margin: "0 auto",
};

const Evac = () => (
    <div style={btn_style}>
        <A href="/evac/evacteam/new" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">CREATE NEW EVAC TEAM</A>
        <A href="/evac/evacteam/list" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM LIST</A>
        <A href="" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">DEPLOY EVAC TEAM</A>
        <A href="" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM DEBRIEF</A>
        <A href="/evac/teammember/new" style={link_style} class="btn btn-warning btn-lg btn-block">ADD TEAM MEMBER</A>
        <br/>
        <br/>
        <A class="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
    </div>
)

export const NewTeam = () => (
    <div>
        <h1>Evac Team</h1>
        <div>Evac Team Members</div>
        <div>Callsign</div>
        <button class="btn btn-success mr-1">Save</button>
        <A class="btn btn-secondary" href="/evac">Cancel</A>
    </div>
)

export const TeamList = () => (
    <div>
        <h1>Evac Teams</h1>
        <div>for team in teamlist:</div>
        <div>team.number, team.members</div>
    </div>
)

export const NewTeamMember = () => (
    <div>
        <h1>Team Member</h1>
        <div>first name, last name</div>
        <div>cell phone, agency id</div>
        <button class="btn btn-success mr-1">Save</button>
        <A class="btn btn-secondary" href="/evac">Cancel</A>
    </div>
)

export default Evac
