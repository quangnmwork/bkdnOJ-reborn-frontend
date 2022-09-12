import React from "react";
import {Container} from "react-bootstrap";
import {Outlet} from "react-router-dom";

import {Header, Navbar, SubHeader, Footer, ScrollToTopBtn} from "components";

import "./UserApp.scss";

export default class UserApp extends React.Component {
  render() {
    return (
      <>
        <Header />
        <Navbar />
        <SubHeader />

        <div className="content-wrapper">
          {/* <ScrollToTop /> */}
          <Container className="content">
            <Outlet />
          </Container>
        </div>

        <div className="footer-wrapper">
          <Footer />
        </div>
        <ScrollToTopBtn />
      </>
    );
  }
}
