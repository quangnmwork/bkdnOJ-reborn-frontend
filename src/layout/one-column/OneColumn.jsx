import React from "react";

import "./OneColumn.scss";

export default class OneColumn extends React.Component {
  render() {
    let mainContent = this.props.mainContent;
    if (!mainContent) {
      mainContent = [];
    }
    if (!(mainContent instanceof Array)) mainContent = [mainContent];

    return (
      <div className="one-column-wrapper">
        {mainContent.map((Content, idx) => (
          // TODO: Would multiple OneColumn layout affects each others?
          //       Because there would be multiple div with the same key?
          <div
            key={`one-col-${idx}`}
            className="one-column-element"
            id={`one-column-element-i-${idx}`}
          >
            {Content}
          </div>
        ))}
      </div>
    );
  }
}
