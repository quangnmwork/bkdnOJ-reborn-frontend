import React from "react";
import PropTypes from "prop-types";
import {Accordion, Button, Form, Row, Col} from "react-bootstrap";

import {FaTimes, FaFilter} from "react-icons/fa";

import {INITIAL_FILTER} from "./List.jsx";

export default class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...INITIAL_FILTER,
    };
  }

  render() {
    const data = this.state;
    return (
      <Form onSubmit={e => e.preventDefault()}>
        <Accordion defaultActiveKey="-1">
          <Accordion.Item eventKey="0" className="filter">
            <Accordion.Header>Search/Filter</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Form.Label column="sm" lg={2}>
                  {" "}
                  Search{" "}
                </Form.Label>
                <Col lg={4}>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Search (key/name)"
                    value={data.search}
                    onChange={e => this.setState({search: e.target.value})}
                  />
                </Col>

                <Form.Label column="sm" lg={2}>
                  {" "}
                  Thứ tự{" "}
                </Form.Label>
                <Col lg={4}>
                  <Form.Select
                    size="sm"
                    id="ordering"
                    className="mb-1 w-100"
                    onChange={e => this.setState({ordering: e.target.value})}
                    value={data.ordering}
                  >
                    <option value="-start_time">
                      Thời gian bắt đầu giảm dần
                    </option>
                    <option value="start_time">
                      Thời gian bắt đầu tăng dần
                    </option>
                    <option value="-end_time">
                      Thời gian kết thúc giảm dần
                    </option>
                    <option value="end_time">
                      Thời gian kết thúc tăng dần
                    </option>
                  </Form.Select>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Label column="sm"> Visible? </Form.Label>
                  <Form.Select
                    size="sm"
                    id="is_visible"
                    className="mb-1"
                    value={data.is_visible}
                    onChange={e => this.setState({is_visible: e.target.value})}
                  >
                    <option value="">--</option>
                    <option value="True">Public/Limited</option>
                    <option value="False">Private</option>
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Label column="sm"> Frozen? </Form.Label>
                  <Form.Select
                    size="sm"
                    id="enable_frozen"
                    className="mb-1"
                    value={data.enable_frozen}
                    onChange={e =>
                      this.setState({enable_frozen: e.target.value})
                    }
                  >
                    <option value="">--</option>
                    <option value="True">Yes</option>
                    <option value="False">No</option>
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Label column="sm"> Rated? </Form.Label>
                  <Form.Select
                    size="sm"
                    id="is_rated"
                    className="mb-1"
                    value={data.is_rated}
                    onChange={e => this.setState({is_rated: e.target.value})}
                  >
                    <option value="">--</option>
                    <option value="True">Yes</option>
                    <option value="False">No</option>
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Label column="sm"> Format </Form.Label>
                  <Form.Select
                    size="sm"
                    id="format_name"
                    className="mb-1"
                    value={data.format_name}
                    onChange={e => this.setState({format_name: e.target.value})}
                  >
                    <option value="">--</option>
                    <option value="icpc">ICPC</option>
                    <option value="ioi">IOI</option>
                  </Form.Select>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Row>
          <Col>
            <span>
              {/* Bộ lọc:{
                this.props.searchData && <>
                  <code>{JSON.stringify(this.props.searchData)}</code>
                </>
              } */}
            </span>
          </Col>
          <div className="d-flex flex-row-reverse">
            <Button
              size="sm"
              variant="dark"
              className="ml-1 mr-1 btn-svg"
              onClick={() => this.props.setSearchData({...data})}
            >
              <FaFilter size={14} />
              <span className="d-none d-sm-inline">Filter</span>
            </Button>

            <Button
              size="sm"
              variant="dark"
              className="ml-1 mr-1 btn-svg"
              onClick={() => this.props.setSearchData({})}
            >
              <FaTimes size={14} />
              <span className="d-none d-sm-inline">Clear</span>
            </Button>
          </div>
        </Row>
      </Form>
    );
  }
}

Filter.propTypes = {
  searchData: PropTypes.object,
  setSearchData: PropTypes.func,
};
