import React from "react";
import PropTypes from "prop-types";

import {Accordion, Button, Form, Row, Col} from "react-bootstrap";

import {FaTimes, FaFilter} from "react-icons/fa";

import {PROBLEM_INITIAL_FILTER} from "./AdminProblemList";

export default class ProblemSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...PROBLEM_INITIAL_FILTER,
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
                    placeholder="Search (code/title)"
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
                    <option value="-created">Tạo gần đây nhất</option>
                    <option value="created">Tạo cách đây lâu nhất</option>
                    <option value="-modified">Chỉnh sửa gần đây nhất</option>
                    <option value="modified">
                      Chỉnh sửa cách đây lâu nhất
                    </option>
                    <option value="-points">Điểm giảm dần</option>
                    <option value="points">Điểm tăng dần</option>
                  </Form.Select>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Label column="sm"> Public? </Form.Label>
                  <Form.Select
                    size="sm"
                    id="is_public"
                    className="mb-1"
                    value={data.is_public}
                    onChange={e => this.setState({is_public: e.target.value})}
                  >
                    <option value="">--</option>
                    <option value="True">Public</option>
                    <option value="False">Private</option>
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Label column="sm"> Org Private? </Form.Label>
                  <Form.Select
                    size="sm"
                    id="is_organization_private"
                    className="mb-1"
                    value={data.is_organization_private}
                    onChange={e =>
                      this.setState({is_organization_private: e.target.value})
                    }
                  >
                    <option value="">--</option>
                    <option value="True">Yes</option>
                    <option value="False">No</option>
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Label column="sm"> ICPC? </Form.Label>
                  <Form.Select
                    size="sm"
                    id="short_circuit"
                    className="mb-1"
                    value={data.short_circuit}
                    onChange={e =>
                      this.setState({short_circuit: e.target.value})
                    }
                  >
                    <option value="">--</option>
                    <option value="True">Yes</option>
                    <option value="False">No</option>
                  </Form.Select>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Row>
          <Col>
            {/* <span>
              Bộ lọc:{
                this.props.searchData && <>
                  <code>{JSON.stringify(this.props.searchData)}</code>
                </>
              }
            </span> */}
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

ProblemSearchForm.propTypes = {
  searchData: PropTypes.object,
  setSearchData: PropTypes.func,
};
