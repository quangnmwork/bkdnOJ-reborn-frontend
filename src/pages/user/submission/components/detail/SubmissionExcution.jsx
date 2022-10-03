import {useMemo} from "react";
import {Row, Col, Accordion} from "react-bootstrap";
import {CodeEditor} from "components/CodeEditor";
import * as Convert from "ansi-to-html";
import {parseTime, parseMem} from "helpers/textFormatter";
import parse from "html-react-parser";
import {
  JavaIcon,
  PythonIcon,
  CIcon,
  CPPIcon,
} from "assets/language/LanguageIcons";
import {ReactComponent as PascalIcon} from "assets/language/Pascal.svg";
export const iconsMap = {
  java: <JavaIcon />,
  python: <PythonIcon />,
  cpp: <CPPIcon />,
  c: <CIcon />,
  pascal: <PascalIcon />,
};

const getIconByLanguage = language => {
  if (language.includes("C++")) return iconsMap.cpp;
  else if (language.includes("Java")) return iconsMap.java;
  else if (language.includes("Python")) return iconsMap.python;
  else if (language.includes("Pascal")) return iconsMap.pascal;
  else if (language.includes("C")) return iconsMap.c;
  else return undefined;
};

const SubmissionExcution = ({data, verdict}) => {
  const convert = useMemo(() => new Convert(), []);

  return (
    <div className="source info-subsection">
      <Row>
        <Col>
          <h5>Excution</h5>
        </Col>
        <Col>
          <div className="float-right">
            <strong className="mr-2">Result:</strong>
            <span className={`verdict ${verdict.toLowerCase()}`}>
              <span className={`verdict-wrapper ${verdict.toLowerCase()}`}>
                <span className={`text`}>{verdict}</span>
              </span>
            </span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <span>
            <strong>Language: </strong>
            {data.language}
            <span className="pl-2">{getIconByLanguage(data.language)}</span>
          </span>
        </Col>
        <Col>
          <span>
            <strong>Total Time:</strong>
            {parseTime(data.time)}
          </span>
        </Col>
        <Col>
          <span>
            <strong>Memory:</strong>
            {parseMem(data.memory)}
          </span>
        </Col>
      </Row>

      <Row>
        <Col>
          <strong>Source code</strong>
          <Accordion flush>
            <Accordion.Item eventKey="src">
              <Accordion.Button>{">>"} Click to see to expand</Accordion.Button>
              <Accordion.Body>
                <CodeEditor
                  code={data.source}
                  onCodeChange={() => {}}
                  ace={data.language_ace}
                  readOnly={true}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
      <Row>
        <Col>
          <strong>Compile Message</strong>
          <Accordion>
            <Accordion.Item eventKey="compileMessage">
              <Accordion.Button>{">>"} Click to see to expand</Accordion.Button>
              <Accordion.Body
                bsPrefix={"accordion-compile"}
                as={"pre"}
                className="m-2"
              >
                {parse(convert.toHtml(data.error || "No compile Message"))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
    </div>
  );
};

export default SubmissionExcution;
