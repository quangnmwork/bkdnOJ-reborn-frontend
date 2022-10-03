import React from "react";
import {toast} from "react-toastify";
import {Row, Col, Button, Accordion} from "react-bootstrap";
import {VscSave} from "react-icons/vsc";

import userAPI from "api/user";
import {FileUploader, SpinLoader, ErrorBox} from "components";

const saveFile = async blob => {
  const a = document.createElement("a");
  a.download = "users.csv";
  a.href = URL.createObjectURL(blob);
  a.addEventListener("click", () => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
  });
  a.click();
};

export default class UserFromFile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      file: null,
    };
  }

  setFile(file) {
    this.setState({file});
  }

  sendFile(e) {
    this.setState({errors: null});

    e.preventDefault();
    if (!this.state.file) {
      alert("Hãy chọn một file .CSV trước khi Submit");
      return;
    }
    let formData = new FormData();
    formData.append("file", this.state.file);
    this.setState({submitting: true}, async () =>
      userAPI
        .adminGenUserFromCSV({formData})
        .then(res => {
          toast.success("OK Created");
          const blob = new Blob([res.data], {type: "application/csv"});
          saveFile(blob);
          this.props.redirectTo("/admin/users/");
        })
        .catch(err => {
          toast.error(`Cannot create. (${err})`);
          this.setState({errors: err.response.data});
        })
        .finally(() => {
          this.setState({submitting: false});
        })
    );
  }

  render() {
    const {errors} = this.state;

    return (
      <>
        {errors && (
          <div className="m-3">
            <ErrorBox errors={this.state.errors} />
            <p>Full message:</p>
            <hr></hr>
            <pre>{JSON.stringify(errors)}</pre>
          </div>
        )}
        <Accordion defaultActiveKey="1">
          <Accordion.Item eventKey="1" className="help">
            <Accordion.Header>Hướng dẫn file CSV</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col>
                  <div className="border p-1">
                    <p>Xét file csv sau:</p>
                    <pre>{`username,email,first_name,last_name,password\nuser1,user1@mail.com,user1,user1,Jy51ns93@!f\nuser2,user2@mail.com,user2,user2,J8v#zav%p\n`}</pre>
                    <p>
                      Sẽ tạo ra tài khoản <code>user1</code> và{" "}
                      <code>user2</code> với mail, mật khẩu, first_name,
                      last_name tương ứng
                    </p>
                    <p>
                      Có thể bỏ qua hoàn toàn cột email, first_name, last_name.
                      Nhưng nếu có cột thì giá trị phải khác rỗng.
                    </p>
                    <p>
                      Ngoài ra, bạn có thể bỏ qua cột <code>password</code> và
                      hệ thống sẽ tự sinh mật khẩu giúp bạn. Sau khi xử lý xong
                      yêu cầu, hệ thống gửi trả một file csv ghi lại tất cả tài
                      khoản được tạo kèm theo mật khẩu.
                    </p>
                    <p>
                      File này sẽ không được hệ thống lưu trữ vì lý do bảo mật.
                    </p>
                  </div>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" className="help-advanced">
            <Accordion.Header>Tạo tài khoản thi</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col>
                  <div className="border p-1">
                    <p>Xét file csv sau:</p>
                    <pre>{`username,email,first_name,organization
team001,team001@mail.com,BKDN.team1,bkdn
team002,team002@mail.com,BKDN.team2,bkdn
team003,team003@mail.com,HUSC.team3,husc
team004,team004@mail.com,DTU.team4,dtu
team005,team005@mail.com,uni.fictional,uni`}</pre>
                    <p>
                      Chúng ta có thể sử dụng cột first_name để làm tên của đội.
                      Giá trị này sẽ được hiển thị lên Standing.
                    </p>
                    <p>
                      Hệ thống có thể nhận thêm một cột{" "}
                      <code>organization</code>
                      là mã slug của tổ chức. Nếu tìm thấy tổ chức có slug, tài
                      khoản được tạo sẽ có profile được set tổ chức đại diện là
                      organization đó. Mục đích chính là dành cho option tự động
                      set org khi Add Participation trong Contest. Nếu không tìm
                      thấy org với slug này, hệ thống sẽ để trống.
                    </p>
                    <p>
                      Vậy tốt nhất nên tạo sẵn các organization trước khi
                      generate tài khoản dùng cho cuộc thi.
                    </p>
                    <p>
                      Hệ thống sẽ trả lại file CSV để bạn check nếu có tài khoản
                      gán org không thành công, khi có giá trị blank tại row đó.
                    </p>
                  </div>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <div className="border m-1">
          <Row>
            <Col xl={12} className="text-center">
              {this.state.submitting && (
                <div className="loading_3dot">Đang xử lý yêu cầu</div>
              )}
            </Col>
          </Row>
          <Row style={{overflow: "auto"}}>
            <Col className="m-1">
              <FileUploader
                onFileSelectSuccess={file => this.setFile(file)}
                onFileSelectError={({error}) => alert(error)}
              />
            </Col>
            <Col sm={2} className="m-1 flex-center">
              <Button
                variant="dark"
                size="sm"
                className="btn-svg"
                disabled={this.state.submitting}
                onClick={e => this.sendFile(e)}
              >
                <VscSave /> Submit
              </Button>
              {this.state.submitting && (
                <SpinLoader size="20px" margin="0 0 0 15px" />
              )}
            </Col>
          </Row>
        </div>
      </>
    );
  }
}
