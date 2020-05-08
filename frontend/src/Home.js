import React from "react";
import { Link } from 'raviger';

const link_style = {
  textDecoration: "none",
};

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const Home = () => (
  <div style={btn_style}>
    <Link href="/hotline" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">HOTLINE</Link>
    <Link href="/evac" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">EVAC</Link>
    <Link href="/intake" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">INTAKE</Link>
    <Link href="/shelter" style={link_style} className="btn btn-warning btn-lg btn-block">SHELTER MANAGEMENT</Link>
  </div>
)

export default Home
