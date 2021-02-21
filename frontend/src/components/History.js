import React, { useState } from 'react';
import { Card, Collapse, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronCircleDown, faChevronCircleRight
} from '@fortawesome/free-solid-svg-icons';
import { ITEMS_PER_PAGE } from '.././constants'

function History({action_history}) {

  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState(1)
  const numPages = Math.ceil(action_history.length / ITEMS_PER_PAGE)

  return (
    <>
    <hr/>
    <h1 className="mb-3">History<FontAwesomeIcon icon={faChevronCircleRight} hidden={showHistory} onClick={() => setShowHistory(!showHistory)} className="ml-2" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showHistory} onClick={() => setShowHistory(!showHistory)} className="ml-2" style={{verticalAlign:"middle"}} inverse /></h1>
    {action_history.map(action => (
    <Collapse key={action + Math.random()} in={showHistory}>
      <div>
        <Card className="border rounded d-flex mb-2" style={{width:"100%"}}>
          <Card.Body>
            {action}
          </Card.Body>
        </Card>
      </div>
      <Pagination className="custom-page-links" size="lg" onClick={(e) => {setPage(parseInt(e.target.innerText))}}>
        {[...Array(numPages).keys()].map(x => 
        <Pagination.Item key={x+1} active={x+1 === page}>
                  {x+1}
                </Pagination.Item>)
        }
      </Pagination>
    </Collapse>
    ))}
    </>
  );
};

export default History;
