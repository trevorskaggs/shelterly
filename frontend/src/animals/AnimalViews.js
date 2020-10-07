import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import Moment from 'react-moment';
import { Carousel } from 'react-responsive-carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit,
} from '@fortawesome/free-solid-svg-icons';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const link_style = {
  textDecoration: "none",
};

const card_style = {
  width: "90%",
}

const header_style = {
  textAlign: "center",
}

export function AnimalView({id}) {

  const [images, setImages] = useState([]);

  // Initial animal data.
  const [data, setData] = useState({
    owner: null,
    request: null,
    name: '',
    species: '',
    sex: '',
    size: '',
    age: '',
    pcolor: '',
    scolor: '',
    color_notes: '',
    fixed: 'unknown',
    aggressive: 'unknown',
    confined: 'unknown',
    injured: 'unknown',
    behavior_notes: '',
    last_seen: null,
    front_image: null,
    side_image: null,
    extra_images: [],
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchAnimalData = async () => {
      // Fetch Animal data.
      await axios.get('/animals/api/animal/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
        var image_urls = [];
        image_urls = image_urls.concat(response.data.front_image||[]).concat(response.data.side_image||[]).concat(response.data.extra_images);
        setImages(image_urls);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchAnimalData();
  }, [id]);

  return (
    <>
      {/* <h1 style={header_style}>
        Animal Details - {data.status}<Link href={"/animals/animal/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
      </h1> */}
      <br/><br/>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-6">
            <p><b>Name:</b> {data.name||"Unknown"}</p>
            <p><b>Species:</b> {data.species}</p>
            <p><b>Age:</b> {data.age||"Unknown"}</p>
            <p><b>Sex:</b> {data.sex||"Unknown"}</p>
            <p><b>Size:</b> {data.size}</p>
            {data.last_seen ? <p><b>Last Seen:</b> <Moment format="LLL">{data.last_seen}</Moment></p> : ""}
            {data.pcolor ? <p><b>Primary Color:</b> {data.pcolor}</p> : ""}
            {data.scolor ? <p><b>Secondary Color:</b> {data.scolor}</p> : ""}
            {data.color_notes ? <p><b>Color Notes:</b> {data.color_notes}</p> : ""}
            {data.behavior_notes ? <p><b>Behavior Notes:</b> {data.behavior_notes}</p> : ""}
          </div>
          <div className="col-6">
          <div className="slide-container float-right" style={{width:"490px", height:"322px"}}>
          <Carousel className="carousel-wrapper" showThumbs={false} showStatus={false}>
            {images.map(image => (
              <div key={image} className="image-container">
                <img src={image} />
              </div>
            ))}
            </Carousel>
          </div>
            {/* <p><b>Fixed:</b> {data.fixed}</p>
            <p><b>Aggressive:</b> {data.aggressive}</p>
            <p><b>Confined:</b> {data.confined}</p>
            <p><b>Injured:</b> {data.injured}</p> */}
          </div>
        </div>
      </div>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-10">
            {data.request ? <div><b>Request #{data.request}</b><Link href={"/hotline/servicerequest/" + data.request}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></div> : ""}
            {data.owner ? <div><b>Owner:</b> {data.owner_object.first_name} {data.owner_object.last_name} {data.owner_object.phone} {data.owner_object.first_name !== 'Unknown' ? <Link href={"/hotline/owner/" + data.owner}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> : <Link href={"/hotline/owner/edit/" + data.owner}> <FontAwesomeIcon icon={faEdit} inverse /></Link>}</div> : ""}
            <div><b>Location:</b> {data.full_address ? data.full_address : "Unknown"}</div>
          </div>
        </div>
      </div>
      <hr/>
      <div style={btn_style}>
        <Link href={"/animals/animal/edit/" + id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT ANIMAL</Link>
        <br/>
        <br/>
        <Link className="btn btn-secondary btn-lg btn-block" href="/hotline/">BACK</Link>
      </div>
    </>
  );
};
