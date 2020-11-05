import React, { useState } from 'react';
import { Card, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronCircleDown, faChevronCircleRight
} from '@fortawesome/free-solid-svg-icons';

function History({action_history}) {

  // const [actionHistory, setActionHistory] = useState(action_history);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
    <hr/>
    <h1 className="mb-3">History<FontAwesomeIcon icon={faChevronCircleRight} hidden={showHistory} onClick={() => setShowHistory(!showHistory)} className="ml-2" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showHistory} onClick={() => setShowHistory(!showHistory)} className="ml-2" style={{verticalAlign:"middle"}} inverse /></h1>
    {action_history.map(action => (
    <Collapse key={action} in={showHistory}>
      <div>
        <Card className="border rounded d-flex mb-2" style={{width:"100%"}}>
          <Card.Body>
            {action}
          </Card.Body>
        </Card>
      </div>
    </Collapse>
    ))}
    </>
  );
};

export default History;
