import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, ButtonGroup, Card, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faUserAlt, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import ReactImageFallback from 'react-image-fallback';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { S3_BUCKET } from '../constants';

function ShelterRoomAssignment({id}) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    building_id = null,
  } = queryParams;

  const [data, setData] = useState({
    name: '',
    address: '',
    full_address: '',
    city: '',
    state: '',
    zip_code: '',
    description: '',
    image: '',
    buildings: [],
    rooms: [],
    action_history: [],
    unroomed_animals: [],
    animal_count: 0,
  });

  const [selectedBuilding, setSelectedBuilding] = useState(Number(building_id));

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
        setData(prevState => ({ ...prevState, 'unroomed_animals':animals }));
      }
      else {
        animals = Array.from(data.rooms[source.droppableId].animals);
        const [reorderedItem] = animals.splice(source.index, 1);
        animals.splice(destination.index, 0, reorderedItem);
        let rooms = Array.from(data.rooms);
        rooms[source.droppableId].animals = animals;
        setData(prevState => ({ ...prevState, 'rooms':rooms }));
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
      setData(prevState => ({ ...prevState, 'rooms':rooms, 'unroomed_animals':unroomed_animals }));
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
        if (!selectedBuilding && response.data.buildings.length > 0) {
          setSelectedBuilding(response.data.buildings[0].id)
        }
      })
      .catch(e => {
        console.log(e);
      });
    };
    fetchShelterData();
  }, [id, selectedBuilding]);

  return (
    <>
      <Header>
        {data.name}
        <OverlayTrigger
          key={"shelter-details"}
          placement="bottom"
          overlay={
            <Tooltip id={`tooltip-shelter-details`}>
              Shelter details
            </Tooltip>
          }
        >
          <Link href={"/shelter/" + id}><FontAwesomeIcon icon={faClipboardList} size="sm" className="ml-1" inverse /></Link>
        </OverlayTrigger>
        &nbsp;- Room Animals
      </Header>
      <hr/>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Row className="mb-3 d-flex" style={{height:"111px"}}>
          <div className="col">
            <h4 style={{marginBottom:"3px"}}>Roomless Animals</h4>
            <Droppable droppableId="unroomed_animals" direction="horizontal">
              {(provided, snapshot) => (
              <Card className="border rounded" style={{height:"91px", display:"flex", justifyContent:"space-around", overflow:"auto", backgroundColor:snapshot.isDraggingOver ? "gray" : "#303030"}}>
                <Scrollbar style={{height:"89px", width:"99.99%"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px"}}/>}>
                  <Card.Body style={{paddingBottom:"3px", display:"flex", flexDirection:"column"}}>
                    <ul className="unroomed_animals" {...provided.droppableProps} ref={provided.innerRef}>
                    {data.unroomed_animals.map((animal, index) => (
                      <Draggable key={animal.id} draggableId={String(animal.id)} index={index}>
                        {(provided, snapshot) => (
                          <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className={"border rounded" + (snapshot.isDragging ? " border-danger" : "")} style={{width:"150px", whiteSpace:"nowrap", overflow:"hidden"}}>
                              <div className="row no-gutters" style={{ textTransform:"capitalize" }}>
                                <div className="mb-0">
                                  <ReactImageFallback style={{width:"47px", height:"47px", marginRight:"3px", objectFit:"cover", overflow:"hidden", float:"left"}} src={animal.front_image} fallbackImage={[animal.side_image, `${S3_BUCKET}images/image-not-found.png`]} />
                                  <span title={animal.name}>{animal.name||"Unknown"}</span>
                                  <div>
                                    #{animal.id}&nbsp;
                                    {animal.species}&nbsp;
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
                                      <FontAwesomeIcon icon={faUserAltSlash} size="sm" />
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
                                      <FontAwesomeIcon icon={faUserAlt} size="sm" />
                                    </OverlayTrigger>}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    </ul>
                  </Card.Body>
                </Scrollbar>
              </Card>
              )}
            </Droppable>
          </div>
        </Row>
        <h4 className="mt-3" style={{marginBottom:"1px"}}>Buildings</h4>
        <Row className="d-flex ml-0 mr-0 mt-1 mb-3 border rounded">
          <ButtonGroup className="hide-scrollbars" style={{whiteSpace:"nowrap", overflow:"auto"}}>
            {data.buildings.map(building => (
              <Button key={building.id} variant={selectedBuilding === building.id ? "primary" : "secondary"} onClick={() => setSelectedBuilding(building.id)}>{building.name}</Button>
            ))}
          </ButtonGroup>
        </Row>
        <h4 style={{marginBottom:"-13px"}}>Rooms</h4>
        <hr style={{marginBottom:"5px"}} />
        <Scrollbar style={{height:"509px"}} no_shadow="true" renderView={props => <div {...props} style={{...props.style, overflowX:"hidden", overflowY:"scroll"}}/>} renderThumbHorizontal={props => <div {...props} style={{...props.style, display:"none"}} />}>
        <Row className="d-flex ml-0">
          {data.rooms.map((room, index) => (
            <span key={room.id} hidden={room.building !== selectedBuilding} style={{marginTop:"5px", marginBottom:"0px"}}>{room.name}<Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
              <span className="col">
                <Droppable droppableId={String(index)}>
                  {(provided, snapshot) => (
                  <Card className="border rounded mr-3 animals" style={{width:"190px", minHeight: "213px", height: "213px", display:"flex", overflowY:"auto", backgroundColor:snapshot.isDraggingOver ? "gray" : "#303030"}} {...provided.droppableProps} ref={provided.innerRef}>
                    <Scrollbar style={{height:"211px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-19px"}}/>}>
                      <Card.Body style={{paddingTop:"15px", paddingBottom:"0px", display:"flex", flexDirection:"column"}}>
                      {room.animals.map((animal, index) => (
                        <Draggable key={animal.id} draggableId={String(animal.id)} index={index}>
                          {(provided, snapshot) => (
                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Card className={"border rounded" + (snapshot.isDragging ? " border-danger" : "")} style={{width:"150px", whiteSpace:"nowrap", overflow:"hidden"}}>
                                <div className="row no-gutters" style={{ textTransform:"capitalize" }}>
                                  <div className="mb-0">
                                    <ReactImageFallback style={{width:"47px", height:"47px", marginRight:"3px", objectFit:"cover", overflow:"hidden", float:"left"}} src={animal.front_image} fallbackImage={[animal.side_image, `${S3_BUCKET}images/image-not-found.png`]} />
                                    <span title={animal.name}>{animal.name||"Unknown"}</span>
                                    <div>
                                      #{animal.id}&nbsp;
                                      {animal.species}&nbsp;
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
                                        <FontAwesomeIcon icon={faUserAltSlash} size="sm" />
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
                                        <FontAwesomeIcon icon={faUserAlt} size="sm" />
                                      </OverlayTrigger>}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      </Card.Body>
                    </Scrollbar>
                  </Card>
                  )}
                </Droppable>
              </span>
            </span>
          ))}
          {data.rooms.filter(room => room.building === selectedBuilding).length < 1 ? "This building does not have any rooms yet." : ""}
        </Row>
        </Scrollbar>
      </DragDropContext>
    </>
  );
};

export default ShelterRoomAssignment;
