import {parseTime, parseMem} from "helpers/textFormatter";

import {useState, useCallback, useEffect} from "react";
import {BsChevronLeft} from "react-icons/bs";
import {Row, Col, Table} from "react-bootstrap";

const inputMock = "858\n123 456 789\n1509 99..";
const canViewTestData = true;

const SubmissionTestCase = ({data, maxTime, isAllToggle, canViewTest}) => {
  const [toggle, setToggle] = useState(false);
  const onToggle = () => {
    setToggle(val => !val);
  };
  useEffect(() => {
    setToggle(isAllToggle);
  }, [isAllToggle]);

  return (
    <>
      <tr className="test-case-result">
        <td>
          <strong>Case#{data.case}</strong>
        </td>
        <td>
          <span className={`verdict ${data.status.toLowerCase()}`}>
            <span className={`verdict-wrapper ${data.status.toLowerCase()}`}>
              <span className="text">{data.status}</span>
            </span>
          </span>
        </td>
        <td>
          <span className="time">
            {data.status === "tle"
              ? `>${parseTime(maxTime)}`
              : parseTime(data.time)}
          </span>
        </td>
        <td>
          <span className="time">{parseMem(data.memory)}</span>
        </td>
        {canViewTest && (
          <td className="text-end mr-2">
            <button
              onClick={onToggle}
              className={`${
                toggle ? "test-case-expand__rotate" : ""
              } test-case-expand`}
            >
              <BsChevronLeft />
            </button>
          </td>
        )}
      </tr>
      {canViewTest && (
        <tr
          className={`${
            !toggle ? "test-case-detail__hide" : ""
          } test-case-detail `}
        >
          <td colSpan="6">
            <div>
              <div className="test-case-info">
                <h3>Input</h3>
                <pre>{inputMock}</pre>
              </div>
              <div className="test-case-info">
                <h3>Participant's Output</h3>
                <pre>{inputMock}</pre>
              </div>
              <div className="test-case-info">
                <h3>Judge's Output</h3>
                <pre>{inputMock}</pre>
              </div>
              <hr className />
              <div className="test-case-info">
                <h3>Judge Feedback : OK</h3>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const SubmissionTestCaseTable = ({data}) => {
  const [allToggle, setAllToggle] = useState(false);
  const onToggle = useCallback(val => {
    setAllToggle(val);
  }, []);
  // useEffect(() => {
  //   problemAPI.adminGetProblemDetailsTest({shortname: "APLUSB"}).then(res => {
  //     console.log(res);
  //   });
  // }, []);
  console.log(data);
  return (
    <div className="test-result info-subsection">
      <div className="d-flex justify-content-between">
        <h5>Test Result</h5>
        {data.test_cases.length && canViewTestData ? (
          <div>
            <button
              className="rounded-pill btn border border-dark"
              onClick={() => onToggle(true)}
            >
              Expand All
            </button>
            <button
              className="rounded-pill btn border border-dark ml-3"
              onClick={() => onToggle(false)}
            >
              Collapse All
            </button>
          </div>
        ) : null}
      </div>
      <Row>
        <Col>
          <Table responsive size="xs">
            <tbody>
              {data.test_cases.map(test_case => (
                <SubmissionTestCase
                  canViewTest={canViewTestData}
                  isAllToggle={allToggle}
                  key={test_case.id}
                  data={test_case}
                  problem={data.problem}
                />
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default SubmissionTestCaseTable;
