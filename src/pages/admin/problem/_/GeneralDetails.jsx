import React from "react";
import {Accordion, Form, Row, Col, Button} from "react-bootstrap";

import {FaRegSave} from "react-icons/fa";

import {toast} from "react-toastify";

import problemAPI from "api/problem";
import commonAPI from "api/common";
import {withNavigation} from "helpers/react-router";
import {SpinLoader, FileUploader, RichTextEditor} from "components";

import UserMultiSelect from "components/SelectMulti/User";
import OrgMultiSelect from "components/SelectMulti/Org";
import {qmClarify} from "helpers/components";

class GeneralDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      selectedPdf: null,
      submitting: false,
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({data: this.props.data});
    }
  }

  setSelectedPdf(file) {
    this.setState({selectedPdf: file});
  }

  inputChangeHandler(event, params = {isCheckbox: null}) {
    const isCheckbox = params.isCheckbox || false;

    let newData = this.state.data;
    if (!isCheckbox) newData[event.target.id] = event.target.value;
    else {
      newData[event.target.id] = !newData[event.target.id];
    }
    this.setState({data: newData});
  }
  getTime(key) {
    const data = this.state.data;
    if (data && data[key]) {
      let time = new Date(data[key]);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 16);
    }
    return "";
  }
  setTime(key, v) {
    let time = new Date(v);
    const data = this.state.data;
    this.setState({data: {...data, [key]: time.toISOString()}});
  }
  setContent(v) {
    const {data} = this.state;
    this.setState({data: {...data, content: v}});
  }

  formSubmitHandler(e) {
    e.preventDefault();
    if (this.state.submitting) return;
    if (this.props.setErrors) {
      this.props.setErrors(null);
    }

    // eslint-disable-next-line no-unused-vars
    let {pdf, ...sendData} = this.state.data;
    delete sendData.allowed_languages;
    let reqs = [];

    console.log(sendData);

    reqs.push(
      problemAPI.adminEditProblemDetails({
        shortname: this.props.shortname,
        data: sendData,
      })
    );

    if (this.state.selectedPdf) {
      const formData = new FormData();
      formData.append("pdf", this.state.selectedPdf);
      reqs.push(
        problemAPI.adminEditProblemDetailsForm({
          shortname: this.props.shortname,
          formData,
        })
      );
    }

    Promise.all(reqs)
      .then(results => {
        toast.success("OK Updated.");
        this.setState({
          data: results[0].data,
          submitting: false,
        });
        this.props.setProblemTitle &&
          this.props.setProblemTitle(results[0].data.title);
        if (results[0].data.shortname !== this.props.shortname) {
          this.props.refetch(results[0].data.shortname);
          this.props.navigate(`/admin/problem/${results[0].data.shortname}`);
        } else this.props.refetch();
      })
      .catch(err => {
        const data = err.response.data;
        this.setState({submitting: false});
        if (this.props.setErrors) {
          this.props.setErrors({errors: data});
        }
      });
  }

  downloadPdf(url) {
    const toastId = toast.loading("Downloading..");
    commonAPI
      .downloadFile(url)
      .then(response => {
        toast.update(toastId, {
          render: "Saved",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);

        // create "a" HTLM element with href to file & click
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", "problem.pdf"); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      })
      .catch(err => {
        toast.update(toastId, {
          render: "Download PDF failed. Check console for more info.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.log("Cannot download pdf.", err);
      });
  }

  render() {
    const {data} = this.state;
    return (
      <Form id="problem-general" onSubmit={e => this.formSubmitHandler(e)}>
        <Row className="options m-1 border">
          <Col>
            {this.state.submitting && (
              <span className="loading_3dot">Đang xử lý yêu cầu</span>
            )}
          </Col>
        </Row>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0" className="general">
            <Accordion.Header>Thiết lập chung</Accordion.Header>
            <Accordion.Body>
              {/* <Row>
                <Form.Label column="sm" lg={2}> Resource URL </Form.Label>
                <Col> <Form.Control size="sm" type="text" placeholder="Problem URL" id="url"
                        value={data.url} disabled
                /></Col>
              </Row> */}
              <Row>
                <Form.Label column="sm" md={2} className="required">
                  {" "}
                  Problem Code{" "}
                </Form.Label>
                <Col md={3}>
                  {" "}
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Problem Code"
                    id="shortname"
                    value={data.shortname}
                    onChange={e => this.inputChangeHandler(e)}
                    required
                  />
                </Col>

                <Form.Label column="sm" md={1} className="required">
                  {" "}
                  Title{" "}
                </Form.Label>
                <Col md={6}>
                  {" "}
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Problem Title"
                    id="title"
                    value={data.title}
                    onChange={e => this.inputChangeHandler(e)}
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" md={2}>
                  {" "}
                  Ngày tạo{" "}
                </Form.Label>
                <Col>
                  {" "}
                  <Form.Control
                    size="sm"
                    type="datetime-local"
                    id="created"
                    onChange={e => this.setTime(e.target.id, e.target.value)}
                    value={this.getTime("created") || ""}
                  />
                </Col>
              </Row>

              <Row>
                <Form.Label column="sm" lg={12}>
                  {" "}
                  Problem Statement{" "}
                </Form.Label>
                <Col className="pb-2">
                  <RichTextEditor
                    value={data.content || ""}
                    onChange={v => this.setContent(v)}
                    enableEdit={true}
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" xl={12}>
                  {" "}
                  PDF{" "}
                </Form.Label>
                <Col md={6}>
                  {data.pdf ? (
                    <a
                      /*href={data.pdf}*/ className="text-truncate style-as-default-link"
                      onClick={() => this.downloadPdf(data.pdf)}
                    >
                      {data.pdf}
                    </a>
                  ) : (
                    "None"
                  )}
                </Col>
                <Col md={6}>
                  <FileUploader
                    onFileSelectSuccess={file => this.setSelectedPdf(file)}
                    onFileSelectError={({error}) => alert(error)}
                  />
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className="problem-access-control">
            <Accordion.Header>Quyền truy cập</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Form.Label column="sm" sm={3} className="required">
                  {" "}
                  Authors{" "}
                </Form.Label>
                <Col>
                  <UserMultiSelect
                    id="authors"
                    value={data.authors || []}
                    onChange={arr =>
                      this.setState({data: {...data, authors: arr}})
                    }
                  />
                </Col>
                <Col xl={12}>
                  <sub>
                    Đặc quyền Tác giả, Tác giả có thể thấy và edit được Problem.
                    Tên sẽ hiển thị công khai.
                  </sub>
                  <sub className="text-danger">
                    <strong> *Cẩn thận!</strong> Bạn có thể mất quyền Edit
                    problem này nếu bạn xóa bản thân ra khỏi danh sách Authors!
                  </sub>
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" sm={3}>
                  {" "}
                  Collaborators{" "}
                </Form.Label>
                <Col>
                  <UserMultiSelect
                    id="collaborators"
                    value={data.collaborators || []}
                    onChange={arr =>
                      this.setState({data: {...data, collaborators: arr}})
                    }
                  />
                </Col>
                <Col xl={12}>
                  <sub>
                    Đặc quyền Cộng tác viên, Cộng tác viên có thể thấy và edit
                    được Problem. Tên sẽ được ẩn khỏi công khai.
                  </sub>
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" sm={3}>
                  {" "}
                  Reviewers{" "}
                </Form.Label>
                <Col>
                  <UserMultiSelect
                    id="reviewers"
                    value={data.reviewers || []}
                    onChange={arr =>
                      this.setState({data: {...data, reviewers: arr}})
                    }
                  />
                </Col>
                <Col xl={12}>
                  <sub>
                    Đặc quyền Reviewer, Reviewer có thể thấy và nộp bài được.
                  </sub>
                </Col>
              </Row>

              <Row>
                <Form.Label column="sm" sm={3}>
                  {" "}
                  Công khai?{" "}
                </Form.Label>
                <Col sm={9}>
                  <Form.Control
                    size="sm"
                    type="checkbox"
                    id="is_public"
                    checked={data.is_public}
                    onChange={e =>
                      this.inputChangeHandler(e, {isCheckbox: true})
                    }
                  />
                </Col>
                <Col xl={12}>
                  <sub>
                    Công khai cho <strong>public hoặc cho các tổ chức</strong>.
                    Nếu không tick, chỉ có 3 nhóm đặc quyền kể trên mới truy cập
                    được problem.
                  </sub>
                </Col>
              </Row>

              <Row>
                <Form.Label column="sm" sm={3}>
                  {" "}
                  Chỉ Công khai cho Tổ chức?{" "}
                </Form.Label>
                <Col sm={9}>
                  <Form.Control
                    size="sm"
                    type="checkbox"
                    id="is_organization_private"
                    checked={data.is_organization_private}
                    onChange={e =>
                      this.inputChangeHandler(e, {isCheckbox: true})
                    }
                  />
                </Col>

                <Form.Label column="sm" sm={3}>
                  {" "}
                  Tổ chức{" "}
                </Form.Label>
                <Col sm={9}>
                  <OrgMultiSelect
                    id="organizations"
                    value={data.organizations || []}
                    onChange={arr =>
                      this.setState({data: {...data, organizations: arr}})
                    }
                  />
                </Col>

                <Col xl={12}>
                  <sub>
                    Chỉ có tác dụng nếu <strong>problem đang Công khai</strong>.
                    Nếu <strong>có tick, chỉ những thành viên </strong>
                    của Tổ chức được thêm và những Tổ chức con thấy được
                    problem. Ngoài ra, những admin của tổ chức sẽ edit được
                    problem.
                  </sub>
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" lg={4}>
                  {" "}
                  Chính sách xem chi tiết Submission{" "}
                </Form.Label>
                <Col>
                  <Form.Select
                    aria-label={data.submission_visibility_mode}
                    value={data.submission_visibility_mode || ""}
                    onChange={e => this.inputChangeHandler(e)}
                    size="sm"
                    id="submission_visibility_mode"
                    className="mb-1 w-100"
                  >
                    <option value="FOLLOW">
                      Default (Chỉ thấy của bản thân)
                    </option>
                    <option value="ALWAYS">User thấy tất cả Submission</option>
                    <option value="SOLVED">
                      User chỉ thấy Sub bản thân, nếu giải được sẽ thấy Sub
                      người khác.
                    </option>
                    <option value="ONLY_OWN">
                      User chỉ thấy Sub của bản thân
                    </option>
                    <option value="HIDDEN">
                      Không cho phép xem chi tiết Sub
                    </option>
                  </Form.Select>
                </Col>

                <Col xl={12}>
                  <sub>
                    Chính sách hiển thị chi tiết Submission của Problem này chỉ
                    có tác dụng với các User mà có quyền view problem.
                  </sub>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2" className="constraints-scoring">
            <Accordion.Header>Rằng buộc và Tính điểm</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Form.Label column="sm" xs={4}>
                  {" "}
                  Time Limit (s)
                </Form.Label>
                <Col>
                  {" "}
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="1.0"
                    id="time_limit"
                    value={data.time_limit}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" xs={4}>
                  {" "}
                  Memory Limit (KBs)
                </Form.Label>
                <Col>
                  <Form.Control
                    size="sm"
                    type="number"
                    placeholder="256000"
                    id="memory_limit"
                    value={data.memory_limit}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
              </Row>

              <Row>
                <Form.Label column="sm" xs={6}>
                  ICPC
                  {qmClarify(
                    "Dừng chấm bài nếu có một test cho kết quả sai. Option nên tick cho khi " +
                      "problem nằm trong contest ICPC, hoặc problem có nhiều test."
                  )}{" "}
                </Form.Label>
                <Col xs={6}>
                  <Form.Control
                    size="sm"
                    type="checkbox"
                    id="short_circuit"
                    checked={data.short_circuit}
                    onChange={e =>
                      this.inputChangeHandler(e, {isCheckbox: true})
                    }
                  />
                </Col>
                <Col xl={12}>
                  <sub>
                    Dừng chấm bài nếu submission cho ra một test cho kết quả
                    không được chấp nhận.
                  </sub>
                </Col>
              </Row>

              <sub>
                Những thiết lập dưới đây chỉ có tác dụng khi nộp ở Practice
              </sub>
              <Row>
                <Form.Label column="sm" xs={2}>
                  {" "}
                  Điểm{" "}
                </Form.Label>
                <Col>
                  <Form.Control
                    size="sm"
                    type="number"
                    id="points"
                    value={data.points}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" xs={6}>
                  {" "}
                  Cho phép ăn điểm từng test{" "}
                </Form.Label>
                <Col xs={6}>
                  <Form.Control
                    size="sm"
                    type="checkbox"
                    id="partial"
                    checked={data.partial}
                    onChange={e =>
                      this.inputChangeHandler(e, {isCheckbox: true})
                    }
                  />
                </Col>
                <Col xl={12}>
                  <sub>
                    Cho phép ăn điểm theo từng test đúng. Nếu không tick thì
                    người dùng chỉ có thể được 0đ hoặc full điểm.
                  </sub>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Row>
          <Col xl={10}></Col>
          <Col className="justify-content-end">
            <Button variant="dark" size="sm" type="submit" className="btn-svg">
              <FaRegSave /> Save
            </Button>
            {this.state.submitting && (
              <SpinLoader size={20} margin="auto 0 auto 15px" />
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
let wrapped = GeneralDetails;
wrapped = withNavigation(wrapped);
export default wrapped;
