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
        <A href="/evac/evacteam/new" style={link_style}><button class="btn btn-warning btn-lg btn-block mb-2">CREATE NEW EVAC TEAM</button></A>
        <A href="/evac/evacteam/list" style={link_style}><button class="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM LIST</button></A>
        <A href="" style={link_style}><button class="btn btn-warning btn-lg btn-block mb-2">DEPLOY EVAC TEAM</button></A>
        <A href="" style={link_style}><button class="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM DEBRIEF</button></A>
        <A href="/evac/teammember/new" style={link_style}><button class="btn btn-warning btn-lg btn-block">ADD TEAM MEMBER</button></A>
        <br/>
        <br/>
        <A class="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
    </div>
)

export default Evac