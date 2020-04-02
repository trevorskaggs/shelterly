import React from "react";
import { A } from "hookrouter";

const link_style = {
    textDecoration: "none",
};

const btn_style = {
    width: "50%",
    margin: "0 auto",
};

const Home = () => (
    <div style={btn_style}>
        <A href="/hotline/" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">HOTLINE</A>
        <A href="/evac" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">EVAC</A>
        <A href="/intake/" style={link_style} class="btn btn-warning btn-lg btn-block mb-2">INTAKE</A>
        <A href="/shelter/" style={link_style} class="btn btn-warning btn-lg btn-block">SHELTER MANAGEMENT</A>
    </div>
)

export default Home
