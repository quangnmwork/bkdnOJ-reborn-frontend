import React from 'react';

import { connect } from 'react-redux';
import { startPolling } from 'redux/RecentSubmission/actions';

import { toast } from 'react-toastify';
import {Form} from 'react-bootstrap';

import { CodeEditor } from 'components/CodeEditor';

import contestAPI from 'api/contest';
import problemApi from 'api/problem';

import { DEFAULT_LANG_SHORTNAME } from 'constants/aceEditorMode';
import {
  __ls_get_code_editor, __ls_set_code_editor
} from 'helpers/localStorageHelpers';

import 'helpers/importAllAceMode';
import './SubmitForm.scss';

const SOURCE_CODE_LIMIT = 5 * 1024 * 1024; //5MB -> 5*1024*1024 bytes (chars)

class SubmitForm extends React.Component {
  constructor(props) {
    super(props);
    let id2LangMap = {};
    let defaultLang = 0;

    props.lang.forEach((lng) => {
      if (lng.short_name === DEFAULT_LANG_SHORTNAME)
        defaultLang = lng
      id2LangMap[lng.id] = lng;
    })

    this.state = {
      code : "",

      defaultLang: defaultLang,
      selectedLang: defaultLang,

      lang : props.lang,
      id2LangMap,
      redirect: false,
      error: undefined,
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.submitting !== this.props.submitting) {
      // Only submit code when submitting changes from false->true
      // Because submitting will also changes when the Modal closes
      if (prevProps.submitting === true) return;
      const source = this.state.code;

      if (source.trim().length === 0) {
        if (this.props.setSubErrors)
          this.props.setSubErrors('Cannot submit with an empty source code.')
          return;
      }
      if (source.trim().length > SOURCE_CODE_LIMIT) {
        if (this.props.setSubErrors)
          this.props.setSubErrors('Source code >5MB, try minify it then submit again.')
          return;
      }

      const data = {
        language: this.state.selectedLang.id,
        source: this.state.code,
      }
      const prob = this.props.prob
      const contest = this.props.contest

      let endpoint, conf;

      if (contest) {
        endpoint = contestAPI.submitContestProblem
        conf = { key: contest.key, shortname: prob }
      } else {
        endpoint = problemApi.submitToProblem
        conf = { shortname: prob }
      }

      endpoint({...conf, data})
        .then((res) => {
          this.props.setSubId(res.data.id)
          // Send submission -> signal polling
          if (this.props.startPolling)
            this.props.startPolling()
        })
        .catch((err) => {
          if (err.response && err.response.data && err.response.data.detail) {
            toast.error(err.response.data.detail, {
              toastId: "submit-failed",
              // autoClose: false,
            })
            if (this.props.setSubErrors)
              this.props.setSubErrors(err.response.data.detail)
          }
          this.setState({error : err.response.data})
        })
    }
  }

  componentDidMount() {
    const data = __ls_get_code_editor()
    this.setState({...data})
  }

  onCodeEditorChange() {
    const data = {
      code: this.state.code,
      selectedLang: this.state.selectedLang,
    }
    __ls_set_code_editor(JSON.stringify(data))
  }

  onLangChange(e) {
    const lang = this.state.id2LangMap[e.target.value]
    const newLang = (lang || this.state.defaultLang)
    this.setState({ selectedLang: newLang, },
      () => this.onCodeEditorChange()
    );
  }

  onCodeChange(newVal) {
    this.setState({ code: newVal, },
      () => this.onCodeEditorChange()
    );
  }

  render() {
    return (
      <Form className="submit-form">
        <Form.Group className="select-div" >
          <Form.Label>Language: </Form.Label>
          <Form.Select onChange={(e) => this.onLangChange(e)}
            value={this.state.selectedLang.id}
          >
            {
              this.state.lang.map((lng) =>
                (<option key={lng.id} value={lng.id}>{lng.name}</option>)
              )
            }
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-1">
          <Form.Label>Code:</Form.Label>
          {/* <AceEditor
            mode={this.getAceMode()}
            theme="github"
            onChange={(val) => this.onCodeChange(val)}
            value={this.state.code}
            name="submit-form-code-editor"
            editorProps={{ $blockScrolling: true }}
            style={styles.ace}
          /> */}
          <CodeEditor
            onCodeChange={(val) => this.onCodeChange(val)}
            code={this.state.code}
            ace={this.state.selectedLang.ace}
            readOnly={this.props.submitting}
          />
        </Form.Group>
      </Form>
    )
  }
}

let wrapped = SubmitForm;
const mapDispatchToProps = dispatch => {
  return {
    startPolling: () => dispatch(startPolling()),
  }
}
export default connect(null, mapDispatchToProps)(wrapped);
