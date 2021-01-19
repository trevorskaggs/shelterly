import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faUserAlt, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import ReactImageFallback from 'react-image-fallback';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from '../components/Header';
import noImageFound from '../static/images/image-not-found.png';

export function ShelterAssignment({id}) {

  const [data, setData] = useState({
    name: '',
    address: '',
    full_address: '',
    city: '',
    state: '',
    zip_code: '',
    description: '',
    image: '',
    rooms: [],
    action_history: [],
    unroomed_animals: [],
    animal_count: 0,
  });

  function handleOnDragEnd(result) {

    const { destination, source, draggableId } = result;

    // Bail if invalid destination.
    if (!destination) return;

    // Bail if no changes.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Ordering within same room.
    if (source.droppableId === destination.droppableId) {
      let animals = [];
      if (source.droppableId === 'unroomed_animals') {
        animals = Array.from(data.unroomed_animals);
        const [reorderedItem] = animals.splice(source.index, 1);
        animals.splice(destination.index, 0, reorderedItem);
        setData(prevState => ({ ...prevState, ['unroomed_animals']:animals }));
      }
      else {
        animals = Array.from(data.rooms[source.droppableId].animals);
        const [reorderedItem] = animals.splice(source.index, 1);
        animals.splice(destination.index, 0, reorderedItem);
        let rooms = data.rooms;
        rooms[source.droppableId].animals = animals;
        setData(prevState => ({ ...prevState, ['rooms']:rooms }));
      }
      axios.patch('/animals/api/animal/' + Number(draggableId) + '/', {set_order:destination.index})
      .catch(error => {
        console.log(error.response);
      });
    }
    else {
      let source_animals = [];
      let dest_animals = [];
      let rooms = Array.from(data.rooms);
      let unroomed_animals = Array.from(data.unroomed_animals);
      // Unroomed to room.
      if (source.droppableId === 'unroomed_animals') {
        dest_animals = Array.from(data.rooms[destination.droppableId].animals);
        const [reorderedItem] = unroomed_animals.splice(source.index, 1);
        dest_animals.splice(destination.index, 0, reorderedItem);
        rooms[destination.droppableId].animals = dest_animals;
        axios.patch('/animals/api/animal/' + Number(draggableId) + '/', {room:data.rooms[destination.droppableId].id, set_order:destination.index})
        .catch(error => {
          console.log(error.response);
        });
      }
      // Room to unroomed.
      else if (destination.droppableId === 'unroomed_animals') {
        source_animals = Array.from(data.rooms[source.droppableId].animals);
        const [reorderedItem] = source_animals.splice(source.index, 1);
        unroomed_animals.splice(destination.index, 0, reorderedItem);
        rooms[source.droppableId].animals = source_animals;
        axios.patch('/animals/api/animal/' + Number(draggableId) + '/', {room:null, set_order:destination.index})
        .catch(error => {
          console.log(error.response);
        });
      }
      // Room to room.
      else {
        dest_animals = Array.from(data.rooms[destination.droppableId].animals);
        source_animals = Array.from(data.rooms[source.droppableId].animals);
        const [reorderedItem] = source_animals.splice(source.index, 1);
        dest_animals.splice(destination.index, 0, reorderedItem);
        rooms[destination.droppableId].animals = dest_animals;
        rooms[source.droppableId].animals = source_animals.filter(animal => animal.id !== Number(draggableId));
        axios.patch('/animals/api/animal/' + Number(draggableId) + '/', {room:data.rooms[destination.droppableId].id, set_order:destination.index})
        .catch(error => {
          console.log(error.response);
        });
      }
      setData(prevState => ({ ...prevState, ['rooms']:rooms, ['unroomed_animals']:unroomed_animals }));
    }
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
      // Fetch Shelter Details data.
      await axios.get('/shelter/api/shelter/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        let rooms = [];
        response.data.buildings.forEach(function(building){
          rooms = rooms.concat(building.rooms);
        });
        response.data['rooms'] = rooms;
        setData(response.data);
      })
      .catch(e => {
        console.log(e);
      });
    };
    fetchShelterData();
  }, [id]);

  return (
    <>
      <Header>
        {data.name} - Room Animals
      </Header>
      <hr/>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Row className="mb-3 d-flex" style={{height:"111px"}}>
          <div className="col">
            <span>Roomless Animals</span>
            <Card className="border rounded" style={{height:"91px", display:"flex", justifyContent:"space-around", overflowX:"scroll"}}>
              <Card.Body style={{paddingBottom:"3px", display:"flex", flexDirection:"column"}}>
                <Droppable droppableId="unroomed_animals" direction="horizontal">
                  {(provided) => (
                    <ul className="unroomed_animals " {...provided.droppableProps} ref={provided.innerRef}>
                    {data.unroomed_animals.map((animal, index) => (
                      <Draggable key={animal.id} draggableId={String(animal.id)} index={index}>
                        {(provided) => (
                          <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className="border rounded" style={{width:"150px", height:"51"}}>
                              <div className="row no-gutters" style={{textTransform: "capitalize"}}>
                                <div className="col-auto">
                                  <ReactImageFallback style={{width:"47px", marginRight:"3px"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
                                </div>
                                <div className="col">
                                  {animal.name||"Unknown"}
                                  {animal.owner_names.length === 0 ?
                                    <OverlayTrigger
                                      key={"stray"}
                                      placement="top"
                                      overlay={
                                        <Tooltip id={`tooltip-stray`}>
                                          Animal is stray
                                        </Tooltip>
                                      }
                                    >
                                      <FontAwesomeIcon icon={faUserAltSlash} size="sm" className="ml-1" />
                                    </OverlayTrigger> :
                                  <OverlayTrigger
                                    key={"stray"}
                                    placement="top"
                                    overlay={
                                      <Tooltip id={`tooltip-stray`}>
                                        {animal.owner_names.map(owner_name => (
                                          <div key={owner_name}>{owner_name}</div>
                                        ))}
                                      </Tooltip>
                                    }
                                  >
                                    <FontAwesomeIcon icon={faUserAlt} size="sm" className="ml-1" />
                                  </OverlayTrigger>}
                                <div>
                                  {animal.size !== 'unknown' ? animal.size : ""} {animal.species}</div>
                                </div>
                              </div>
                            </Card>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </Card.Body>
            </Card>
          </div>
        </Row>
        <Row className="d-flex ml-0">
          {data.rooms.map((room, index) => (
            <span key={room.id} style={{marginBottom:"32px"}}>{room.name}<Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
            <span className="col">
              <Card className="border rounded mr-3" style={{width:"190px", minHeight: "45px", height: "100%"}}>
                <Card.Body style={{paddingBottom:"3px", display:"flex", flexDirection:"column"}}>
                  <Droppable droppableId={String(index)}>
                    {(provided) => (
                      <ul className="animals" {...provided.droppableProps} ref={provided.innerRef}>
                      {room.animals.map((animal, index) => (
                        <Draggable key={animal.id} draggableId={String(animal.id)} index={index}>
                          {(provided) => (
                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Card className="border rounded" style={{width:"150px"}}>
                                <div className="row no-gutters" style={{ textTransform: "capitalize" }}>
                                  <div className="col-auto">
                                    <ReactImageFallback style={{width:"47px", marginRight:"3px"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
                                  </div>
                                  <div className="col">
                                    {animal.name||"Unknown"}
                                    {animal.owner_names.length === 0 ?
                                    <OverlayTrigger
                                      key={"stray"}
                                      placement="top"
                                      overlay={
                                        <Tooltip id={`tooltip-stray`}>
                                          Animal is stray
                                        </Tooltip>
                                      }
                                    >
                                      <FontAwesomeIcon icon={faUserAltSlash} size="sm" className="ml-1" />
                                    </OverlayTrigger> :
                                  <OverlayTrigger
                                    key={"stray"}
                                    placement="top"
                                    overlay={
                                      <Tooltip id={`tooltip-stray`}>
                                        {animal.owner_names.map(owner_name => (
                                          <div key={owner_name}>{owner_name}</div>
                                        ))}
                                      </Tooltip>
                                    }
                                  >
                                    <FontAwesomeIcon icon={faUserAlt} size="sm" className="ml-1" />
                                  </OverlayTrigger>}
                                  <div>
                                    {animal.size !== 'unknown' ? animal.size : ""} {animal.species}</div>
                                  </div>
                                </div>
                              </Card>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </Card.Body>
              </Card></span>
            </span>
          ))}
        </Row>
      </DragDropContext>
    </>
  );
};
