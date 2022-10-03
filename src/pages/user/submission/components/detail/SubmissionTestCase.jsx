import {memo} from "react";
import {parseTime, parseMem} from "helpers/textFormatter";
import {useState, useCallback, useEffect} from "react";
import {BsChevronLeft} from "react-icons/bs";
import {Row, Col, Table} from "react-bootstrap";
import submissionApi from "api/submission";

const SubmissionTestCase = memo(
  ({data, maxTime, isAllToggle, canViewTest, problemId}) => {
    const [toggle, setToggle] = useState(false);
    const [testcaseDetail, setTestcaseDetail] = useState();

    const onToggle = () => {
      setToggle(val => !val);
    };
    useEffect(() => {
      setToggle(isAllToggle);
    }, [isAllToggle]);

    useEffect(() => {
      submissionApi
        .getSubmissionResultCase({case_num: data.case, id: problemId})
        .then(res => {
          setTestcaseDetail(res.data);
        });
    }, []);

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
                  <pre>{testcaseDetail?.input_partial}</pre>
                </div>
                <div className="test-case-info">
                  <h3>Participant's Output</h3>
                  <pre>{testcaseDetail?.output_partial}</pre>
                </div>
                <div className="test-case-info">
                  <h3>Judge's Output</h3>
                  <pre>{testcaseDetail?.answer_partial}</pre>
                </div>
                <hr className />
                <div className="test-case-info">
                  <h3>Judge Feedback : {testcaseDetail?.extended_feedback}</h3>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
);

const SubmissionTestCaseTable = ({submissionData}) => {
  const [allToggle, setAllToggle] = useState(false);
  const [testcase, setTestcase] = useState();
  const onToggle = useCallback(val => {
    setAllToggle(val);
  }, []);

  useEffect(() => {
    submissionApi.getSubmissionResult({id: submissionData.id}).then(res => {
      setTestcase(res.data);
    });
  }, []);

  return (
    <div className="test-result info-subsection">
      <div className="d-flex justify-content-between">
        <h5>Test Result</h5>

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
      </div>
      {testcase ? (
        <Row>
          <Col>
            <Table responsive size="xs">
              <tbody>
                {testcase.test_cases.map(test_case => (
                  <SubmissionTestCase
                    isAllToggle={allToggle}
                    key={test_case.id}
                    data={test_case}
                    canViewTest={testcase.can_view_test_data}
                    problemId={submissionData.id}
                  />
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      ) : null}
    </div>
  );
};

export default SubmissionTestCaseTable;
