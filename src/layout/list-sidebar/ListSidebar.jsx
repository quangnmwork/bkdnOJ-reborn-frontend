import React from "react";
import {Row, Col, Button} from "react-bootstrap";
import {BiArrowFromRight, BiArrowFromLeft} from "react-icons/bi";

import "./ListSidebar.scss";
import OutsideAlerter from "helpers/OutsiderAlerter";

class Offcanvas extends React.Component {
  render() {
    const sideComponents = this.props.sideComponents;

    return (
      <div id="offcanvas" className="offcanvas">
        {sideComponents.map((comp, indx) => (
          <div
            key={`side-component-${indx}`}
            className="side-component rounded"
          >
            {comp}
          </div>
        ))}

        <div className="offcanvasCloseBtn-wrapper">
          <Button
            id="offcanvasCloseBtn"
            className="offcanvasCloseBtn btn-dark hidden"
            onClick={() => this.props.closeCanvas()}
          >
            <BiArrowFromLeft />
          </Button>
        </div>
      </div>
    );
  }
}

/*
 * A better name would be 8-4 layout. This layout will display
   main content by 8 | side content 4 on wide screen. On mobile,
   side content will be put onto an off-canvas, that can be accessed
   by a fixed button on the bottom
 * params:
     - mainContent: a React Component, will appear in the main content section
     - sideComponents: a list of React Components, appear on the side or off-canvas
 */
export default class ListSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      offcanvasShow: false,
    };
  }

  render() {
    const mainContent = this.props.mainContent || <p>This is main content</p>;
    const sideComponents = this.props.sideComponents || [];

    return (
      <div className="list-sidebar-wrapper">
        <Row>
          <div className="d-block d-md-none">
            <OutsideAlerter
              isDetecting={this.state.offcanvasShow}
              outsideClickHandler={() => this.close()}
            >
              <Offcanvas
                closeCanvas={() => this.close()}
                sideComponents={sideComponents}
              />
            </OutsideAlerter>
          </div>

          <Col md={8}>
            <div className="offcanvas-menu" id="offcanvas-menu">
              {mainContent}

              <div className="offcanvasOpenBtn-wrapper">
                <Button
                  className="offcanvasOpenBtn btn-dark d-block d-md-none"
                  onClick={() => this.toggle()}
                >
                  <BiArrowFromRight />
                </Button>
              </div>
            </div>
          </Col>

          <Col md={4} className="side-bar center d-none d-md-flex">
            {sideComponents.map((comp, indx) => (
              <div key={`side-component-${indx}`} className="mb-2">
                <div className="side-component">{comp}</div>
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }

  toggle() {
    const bool = this.state.offcanvasShow;
    if (bool) this.close();
    else this.open();
  }

  open() {
    this.setState({offcanvasShow: true}, () => {
      const sidenav = document.getElementById("offcanvas");
      if (sidenav) sidenav.style.width = "350px";
      // const main = document.getElementById("offcanvas-menu")
      // if (main) main.style.marginRight = "250px";
    });
  }
  close() {
    this.setState({offcanvasShow: false}, () => {
      const sidenav = document.getElementById("offcanvas");
      if (sidenav) sidenav.style.width = "0";
      // const main = document.getElementById("offcanvas-menu")
      // if (main) main.style.marginRight = "0";
    });
  }
}
