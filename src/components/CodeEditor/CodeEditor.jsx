import React from "react";
import PropTypes from "prop-types";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import {modesByName} from "ace-builds/src-noconflict/ext-modelist";
import "helpers/importAllAceMode";

import {FALLBACK_ACE_MODE} from "constants/aceEditorMode";

export default class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  getAceMode() {
    return modesByName[this.props.ace] ? this.props.ace : FALLBACK_ACE_MODE;
  }

  render() {
    return (
      <AceEditor
        mode={this.getAceMode()}
        theme="github"
        onChange={val => this.props.onCodeChange(val)}
        value={this.props.code}
        name="sub-source-code-editor"
        editorProps={{$blockScrolling: true}}
        style={styles.ace}
        readOnly={!!this.props.readOnly}
      />
    );
  }
}

CodeEditor.propTypes = {
  onCodeChange: PropTypes.func,
  code: PropTypes.string,
  ace: PropTypes.string,
};

const styles = {
  ace: {
    width: "100%",
    // maxHeight: "300px",
    overflow: "auto",
  },
};
