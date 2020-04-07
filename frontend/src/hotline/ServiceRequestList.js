import React, { Component } from "react";
import { Table } from "reactstrap";

class ServiceRequestList extends Component {
    render() {
      const service_requests = this.props.service_requests;
      return (
        <Table dark>
          <thead>
            <tr>
              <th>id</th>
              <th>address</th>
            </tr>
          </thead>
          <tbody>
            {!service_requests || service_requests.length <= 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  <b>Ops, no one here yet {service_requests.length}</b>
                </td>
              </tr>
            ) : (
                service_requests.map(sr => (
                <tr key={sr.id}>
                  <td>{sr.address}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      );
    }
  }
  
  export default ServiceRequestList;