import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare,
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
    buildings: [],
    action_history: [],
    unroomed_animals: [],
    animal_count: 0,
    room_count: 0,
  });

  function handleOnDragEnd(result) {
    const animals = Array.from(data.unroomed_animals);
    const [reorderedItem] = animals.splice(result.source.index, 1);
    animals.splice(result.destination.index, 0, reorderedItem);
    setData(prevState => ({ ...prevState, ['unroomed_animals']:animals }));
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
        {data.name} - Assign Animal Rooms
      </Header>
      <hr/>
      <Card className="border rounded d-flex">
        <Card.Body>
          <Card.Title>
            <h4 className="mb-0">Rooms</h4>
          </Card.Title>
          <hr/>
          <span className="d-flex flex-wrap align-items-end">
            {data.buildings.map(building => (
              <span key={building.id} className="d-flex flex-wrap align-items-end">
                {building.rooms.map(room => (
                  <Card key={room.id} className="border rounded mr-3" style={{width:"100px", height:"100px"}}>
                    <Card.Text className="text-center mb-0">
                      {room.name}
                      <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                    </Card.Text>
                    <Card.Text className="text-center mb-0">
                      {room.animals.length} Animals
                    </Card.Text>
                  </Card>
                ))}
              </span>
            ))}
          </span>
        </Card.Body>
      </Card>
      {data.unroomed_animals.length ?
      <div className="row mt-3">
        <div className="col-12 d-flex">
          <Card className="border rounded" style={{width:"100%"}}>
            <Card.Body>
              <Card.Title>
                <h4 className="mb-0">Animals</h4>
              </Card.Title>
              <hr/>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="animals">
                  {(provided) => (
                    <ul className="animals d-flex flex-wrap align-items-end pl-0" {...provided.droppableProps} ref={provided.innerRef} style={{listStyleType:"none"}}>
                    {data.unroomed_animals.map((animal, index) => (
                      <Draggable key={animal.id} draggableId={String(animal.id)} index={index}>
                        {(provided) => (
                          <li style={{display:"inline"}} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <Card className="border rounded mr-3" style={{border:"none"}}>
                            <ReactImageFallback style={{width:"151px"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
                            <Card.Text className="text-center mb-0">
                              {animal.name||"Unknown"}
                              <Link href={"/animals/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                              <Link href={"/animals/edit/" + animal.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                            </Card.Text>
                            <Card.Text className="text-center" style={{textTransform:"capitalize"}}>
                              {animal.size} {animal.species}
                            </Card.Text>
                          </Card>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </Card.Body>
          </Card>
        </div>
      </div> : ""}
    </>
  );
};
