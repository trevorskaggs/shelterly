import React, { useState } from 'react';
import axios from "axios";
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusSquare, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import { faPencil } from '@fortawesome/pro-solid-svg-icons';
import { PhotoDocumentModal, PhotoDocumentEditModal, PhotoDocumentRemovalModal } from './Modals';


function PhotoDocuments(props) {

  const [images, setImages] = useState([]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const handleCloseAddPhoto = () => setShowAddPhoto(false);
  const [photoToRemove, setPhotoToRemove] = useState({id: '', name:'', url:''});
  const [showRemovePhoto, setShowRemovePhoto] = useState(false);
  const handleCloseRemovePhoto = () => setShowRemovePhoto(false);
  const [photoToEdit, setPhotoToEdit] = useState({id: '', name:'', url:''});
  const [showEditPhoto, setShowEditPhoto] = useState(false);
  const handleCloseEditPhoto = () => setShowEditPhoto(false);

  // Handle remove photo.
  const handleSubmitRemovePhoto = async () => {
    await axios.patch(props.url, {'remove_image':photoToRemove.id})
    .then(response => {
      props.setData(prevState => ({ ...prevState, "images":props.data.images.filter(image => image.id !== photoToRemove.id)}));
      handleCloseRemovePhoto()
    })
    .catch(error => {
    });
  }

  return (
    <>
    <div className="row mt-2">
      <div className="col-12 d-flex">
        <Card className="mt-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-20px"}}>
            <Card.Title>
              <h4 className="mb-0">Photo Documents
                  <OverlayTrigger
                    key={"add-photo"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-add-photo`}>
                        Add a photo document to this {props.object}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faPlusSquare} onClick={() => setShowAddPhoto(true)} style={{cursor:'pointer'}} className="ml-1 fa-move-up" inverse />
                  </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr />
            <span className="d-flex flex-wrap align-items-end" style={{marginLeft:"-15px"}}>
            {props.data.images.map((image, index) => (
              <span key={index} className="ml-3 mb-3">
                <Card className="border rounded animal-hover-div" style={{width:"153px", whiteSpace:"nowrap", overflow:"hidden"}}>
                  <a href={image.url} target="_blank" rel="noreferrer" className="animal-link" style={{textDecoration:"none", color:"white"}}>
                    <Card.Img className="border-bottom animal-hover-div" variant="top" src={image.url || "/static/images/image-not-found.png"} style={{width:"153px", height:"153px", objectFit: "cover", overflow: "hidden"}} />
                  </a>
                  <Card.Text className="mb-0">
                    <span title={image.name||image.url.split('/').pop().split('.')[0]} className="ml-1" style={{display:"inline-block", width:"111px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:"-5px"}}>{image.name||image.url.split('/').pop().split('.')[0]}</span>
                    <OverlayTrigger
                      key={"edit-photo"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-edit-photo`}>
                          Edit photo document name
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faPencil} className="mr-1" inverse onClick={() => {setPhotoToEdit(image); setShowEditPhoto(true);}} title="Edit photo document name" style={{cursor:'pointer'}} />
                    </OverlayTrigger>
                    <OverlayTrigger
                      key={"remove-photo"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-remove-photo`}>
                          Remove photo document
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faMinusSquare} className="mr-1" inverse onClick={() => {setPhotoToRemove(image); setShowRemovePhoto(true);}} title="Remove photo document" style={{backgroundColor:"red", cursor:'pointer'}} />
                    </OverlayTrigger>
                  </Card.Text>
                </Card>
              </span>
            ))}
            </span>
            {props.data.images.length < 1 ? <div className="mb-3"><span style={{textTransform:"capitalize"}}>{props.object}</span> does not have any photo documents.</div> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    <PhotoDocumentModal images={images} url={props.url} setImages={setImages} setData={props.setData} show={showAddPhoto} handleClose={handleCloseAddPhoto} />
    <PhotoDocumentRemovalModal image={photoToRemove} show={showRemovePhoto} handleClose={handleCloseRemovePhoto} handleSubmit={handleSubmitRemovePhoto} />
    <PhotoDocumentEditModal image={photoToEdit} setData={props.setData} url={props.url} show={showEditPhoto} handleClose={handleCloseEditPhoto} />
    </>
  );
};

export default PhotoDocuments;
