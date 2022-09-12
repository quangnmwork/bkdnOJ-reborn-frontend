import React from "react";

import {Container, Nav, NavDropdown, Image} from "react-bootstrap";
import {Link} from "react-router-dom";

import BTNavbar from "react-bootstrap/Navbar";

import icon from "assets/images/bkdnoj-favicon-noring.png";
import "./Navbar.scss";

import UserAuthSection from "./UserAuthSection";

export default class Navbar extends React.Component {
  render() {
    return (
      <div className="sticky-header">
        <BTNavbar
          bg="light"
          expand="md"
          className="navbar py-0"
          id="navbar" /*fixed="top"*/
        >
          <Container>
            <BTNavbar.Brand as={Link} id="brand" to="/">
              <Image src={icon} id="site-brand" />
              <span>bkdnOJ</span>
            </BTNavbar.Brand>

            <Nav className="navbar-user-auth d-flex flex-row justify-content-end d-md-none">
              <UserAuthSection />
            </Nav>

            <BTNavbar.Toggle aria-controls="basic-navbar-nav" />
            <BTNavbar.Collapse id="basic-navbar-nav">
              <Nav className="">
                {/* <Nav.Link href="#post">Post</Nav.Link> */}
                {/* <Nav.Link as={Link} to="/problems">Problem</Nav.Link>
                                <Nav.Link as={Link} to="/submissions">Submission</Nav.Link> */}

                <NavDropdown title="Practice" id="practice-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/problems">
                    Problem
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/submissions">
                    Submission
                  </NavDropdown.Item>
                </NavDropdown>

                <Nav.Link as={Link} to="/contests">
                  Contest
                </Nav.Link>
                <Nav.Link as={Link} to="/orgs">
                  Organization
                </Nav.Link>
                <Nav.Link as={Link} to="/status">
                  Status
                </Nav.Link>
                {/* <Nav.Link href="#user">User</Nav.Link> */}
              </Nav>
            </BTNavbar.Collapse>

            <Nav className="navbar-user-auth flex-row justify-content-end d-none d-md-flex">
              <UserAuthSection />
            </Nav>
          </Container>
        </BTNavbar>
        {/* <SubHeader/> */}
      </div>
    );
  }
}
