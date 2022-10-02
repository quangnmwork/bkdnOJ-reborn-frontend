import {Row, Col} from "react-bootstrap";
import {Link} from "react-router-dom";

const SubmissionGeneral = ({data, verdict, maxPoints}) => {
  return (
    <div className="general info-subsection">
      <h5 className="subsection">General</h5>
      {data.contest_object && (
        <Col>
          <span>
            <strong>{`This submission was made in contest `}</strong>
            <Link to={`/contest/${data.contest_object}`}>
              {data.contest_object}
            </Link>
          </span>
        </Col>
      )}
      <Row>
        <Col>
          <span>
            <strong>Author:</strong>
            <Link to={`/user/${data.user.user.username}`}>
              {data.user.user.username}
            </Link>
          </span>
        </Col>
        <Col>
          <span>
            <strong>Problem:</strong>
            <Link to={`/problem/${data.problem.shortname}`}>
              {data.problem.title}
            </Link>
          </span>
        </Col>
      </Row>
      <Row>
        <Col>
          <span>
            <strong>Points:</strong>
            {typeof data.points === "number" ? (
              <span className={`verdict ${verdict.toLowerCase()} points`}>
                {`(${data.points}/${maxPoints})`}
              </span>
            ) : (
              <span className="points">Not evaluated</span>
            )}
          </span>
        </Col>
      </Row>
    </div>
  );
};

export default SubmissionGeneral;
