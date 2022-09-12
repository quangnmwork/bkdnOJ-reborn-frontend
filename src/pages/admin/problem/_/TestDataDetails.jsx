import React from "react";
import {toast} from "react-toastify";

import {Accordion, Button, Form, Row, Col} from "react-bootstrap";
import {ErrorBox, SpinLoader, FileUploader} from "components";

import {FaRegSave} from "react-icons/fa";
import {VscRefresh} from "react-icons/vsc";

import problemAPI from "api/problem";

export default class TestDataDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        zipfile: null,
        custom_checker: null,
        custom_checker_remove: false,
        zipfile_remove: false,
        generator_remove: false,
      },
      selectedZip: null,
      selectedCustomChecker: null,
      submitting: false,
    };
  }
  refetch() {
    if (this.state.submitting) return;
    this.setState(
      {
        submitting: true,
        errors: null,
      },
      () => {
        const {shortname} = this.props;
        problemAPI
          .adminGetProblemDetailsData({shortname})
          .then(res => {
            this.setState({
              data: {
                ...res.data,
                zipfile_remove: false,
                generator_remove: false,
              },
              submitting: false,
            });
          })
          .catch(err => {
            this.setState({submitting: false});
            console.log(err);
          });
      }
    );
  }

  componentDidMount() {
    this.refetch();
  }

  setSelectedZip(file) {
    this.setState({selectedZip: file});
  }
  setSelectedCustomChecker(file) {
    this.setState({selectedCustomChecker: file});
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

  formSubmitHandler(e) {
    e.preventDefault();
    if (this.state.submitting) return;
    if (this.props.setErrors) {
      this.props.setErrors(null);
    }

    let {
      // eslint-disable-next-line no-unused-vars
      zipfile,
      ...sendData
    } = this.state.data;
    let formData = new FormData();

    if (this.state.selectedZip)
      formData.append("zipfile", this.state.selectedZip);
    if (this.state.selectedCustomChecker)
      formData.append("custom_checker", this.state.selectedCustomChecker);

    for (let key in sendData) {
      if (![null, undefined].includes(sendData[key]))
        formData.append(key, sendData[key]);
    }

    this.setState({submitting: true}, () => {
      problemAPI
        .adminEditProblemDataForm({
          shortname: this.props.shortname,
          formData,
        })
        .then(() => {
          toast.success("OK Updated.");
          this.props.forceRerender();
        })
        .catch(err => {
          this.setState({
            errors: {
              errors: err.response.data || ["Cannot update problem data."],
            },
            submitting: false,
          });
        });
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
          <Button
            variant="dark"
            size="sm"
            className="btn-svg"
            disabled={this.state.submitting}
            onClick={() => this.refetch()}
          >
            <VscRefresh /> Refresh
          </Button>
        </Row>
        <ErrorBox errors={this.state.errors} />
        <Row>
          <Form.Label column="sm" md={2}>
            {" "}
            Archive{" "}
          </Form.Label>
          <Col md={10}>
            <div className="p-0">
              {data.zipfile ? (
                <a href={data.zipfile} className="text-truncate">
                  {data.zipfile}
                </a>
              ) : (
                "Not Available"
              )}
              <FileUploader
                onFileSelectSuccess={file => this.setSelectedZip(file)}
                onFileSelectError={({error}) => alert(error)}
              />
            </div>
          </Col>

          <Form.Label column="sm" xs={3}>
            {" "}
            Remove Archive?{" "}
          </Form.Label>
          <Col xs={9}>
            <Form.Control
              size="sm"
              type="checkbox"
              id="zipfile_remove"
              checked={data.zipfile_remove}
              onChange={e => this.inputChangeHandler(e, {isCheckbox: true})}
            />
          </Col>
        </Row>
        <Row>
          <Form.Label column="sm" lg={2}>
            {" "}
            Checker{" "}
          </Form.Label>
          <Col lg={10}>
            <Form.Select
              aria-label={data.checker}
              size="sm"
              value={data.checker}
              id="checker"
              onChange={e => this.inputChangeHandler(e)}
              className="mb-1 w-100"
            >
              <option value="standard">Standard</option>
              <option value="floats">Floats</option>
              <option value="floatsabs">Floats (Absolute)</option>
              <option value="floatsrel">Floats (Relative)</option>
              <option value="rstripped">Non-trailing spaces</option>
              <option value="sorted">Unordered</option>
              <option value="identical">Byte identical</option>
              <option value="linecount">Line-by-line</option>
              <option value="custom-PY3">Custom checker (Py3)</option>
              <option value="custom-CPP17">Custom checker (C++17)</option>
              <option value="interactive-CPP17">
                Interactive checker (C++17)
              </option>
            </Form.Select>
          </Col>

          <Form.Label column="sm" lg={2}>
            {" "}
            Custom Checker{" "}
          </Form.Label>
          <Col lg={10}>
            <div className="p-0">
              {data.custom_checker ? (
                <a href={data.custom_checker} className="text-truncate">
                  {data.custom_checker}
                </a>
              ) : (
                "None"
              )}
              <FileUploader
                onFileSelectSuccess={file =>
                  this.setSelectedCustomChecker(file)
                }
                onFileSelectError={({error}) => alert(error)}
              />
            </div>
          </Col>

          <Form.Label column="sm" sm={3}>
            {" "}
            Remove Custom Checker?{" "}
          </Form.Label>
          <Col sm={9}>
            <Form.Control
              size="sm"
              type="checkbox"
              id="custom_checker_remove"
              checked={data.custom_checker_remove}
              onChange={e => this.inputChangeHandler(e, {isCheckbox: true})}
            />
          </Col>

          <Form.Label column="sm" xl={12}>
            {" "}
            Checker Extra Arguments (JSON){" "}
          </Form.Label>
          <Col xl={12}>
            <Form.Control
              size="sm"
              as="textarea"
              placeholder={`{"precision": 6}`}
              id="checker_args"
              value={data.checker_args || ""}
              onChange={e => this.inputChangeHandler(e)}
              className="mb-1"
            />
          </Col>
          <Col xl={12}>
            <sub>
              Tham số thêm cho checker (<code>checker_args</code>)
            </sub>
          </Col>
        </Row>

        <Row>
          <Col lg={10}>
            <sub></sub>
          </Col>
          <Col className="justify-content-end">
            <Button
              variant="dark"
              size="sm"
              type="submit"
              className="btn-svg "
              disabled={this.state.submitting}
            >
              <FaRegSave /> Save
            </Button>
            {this.state.submitting && (
              <SpinLoader size={20} margin="auto 0 auto 15px" />
            )}
          </Col>
        </Row>
        <Row className="help-text checker-help">
          <Col xl={12} className="m-0 p-0">
            <strong>Checker Help</strong>
          </Col>
          <Col xl={12} className="m-0 p-0">
            <Accordion defaultActiveKey="-1">
              <Accordion.Item eventKey="0" className="checker-standard-help">
                <Accordion.Header>Checker: Standard</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>Là checker mặc định khi tạo ra Problem.</p>
                  <p>
                    Checker này sẽ so sánh output submission và output của judge
                    theo từng token, hay word. Cụ thể, một token hay word là một
                    xâu con nằm giữa hai ký tự trắng (space, tab, newline,...).
                    Output sẽ được cắt thành một mảng các token. Bài nộp đúng
                    khi hai output tạo ra hai mảng token giống nhau.
                  </p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1" className="checker-floats-help">
                <Accordion.Header>Checker: Floats</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    Sử dụng checker <code>floats</code> nếu output bị ảnh hưởng
                    bới sai số số thực.
                  </p>
                  <p>
                    Tất cả output không phải số sẽ được xem như string và sẽ so
                    sánh bằng. Đối với output số, chúng sẽ được so sánh số thực
                    dựa vào giá trị của <code>args</code>.
                  </p>
                  <p>
                    Cụ thể, <code>args</code> nhận các khóa sau:
                  </p>
                  <ul>
                    <li>
                      <code>precision</code>: Một số nguyên, mô tả epsilon. Mặc
                      định: <code>6</code>.
                    </li>
                    <li>
                      <code>error_mode</code>: Một xâu ký tự, mô tả chế độ sai
                      số. Mặc định, output sẽ được check theo cả hai absolute và
                      relative, đúng 1 hoặc 2 được xem như đúng. Nếu mang giá
                      trị <code>absolute</code>, check absolute error. Nếu mang
                      giá trị <code>relative</code>, check relative error.
                    </li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2" className="checker-floatsabs-help">
                <Accordion.Header>Checker: Floats (Absolute)</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    Là shortcut cho checker <code>floats</code> với{" "}
                    <code>error_mode</code> là <code>absolute</code>
                  </p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3" className="checker-floatsrel-help">
                <Accordion.Header>Checker: Floats (Relative)</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    Là shortcut cho checker <code>floats</code> với{" "}
                    <code>error_mode</code> là <code>relative</code>
                  </p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item
                eventKey="4"
                className="checker-non-trailing-spaces-help"
              >
                <Accordion.Header>
                  Checker: Non-trailling spaces
                </Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    Output sẽ được so theo từng dòng. Mỗi dòng sẽ được xóa tất
                    cả ký tự trắng phía bên phải trước, sau đó được so sánh
                    bằng. Số lượng dòng phải bằng nhau.
                  </p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="5" className="checker-unordered-help">
                <Accordion.Header>Checker: Unordered</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    Như checker <code>standard</code>, nhưng trước khi so sánh,
                    mảng token sẽ được sort lại.
                  </p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="6" className="checker-identical-help">
                <Accordion.Header>Checker: Byte identical</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>Hai output sẽ được so khớp từng byte một.</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item
                eventKey="7"
                className="checker-line-by-line-help"
              >
                <Accordion.Header>Checker: Line-by-line</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    <code>linecount</code> checker so khớp từng dòng hai output.{" "}
                    <code>args</code> nhận một khóa
                    <code>feedback</code> mặc định là <code>true</code>, nghĩa
                    là yêu cầu máy chấm phản hồi feedback đúng/sai cho từng
                    dòng.
                  </p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="8" className="custom-checker-py3-help">
                <Accordion.Header>Custom Checker: Py3</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    <code>custom-checker</code>
                    sử dụng cho những bài có nhiều đáp án, cần phải có một cách
                    để kiểm tra đáp án của thí sinh là đúng. Đây là lựa chọn
                    dành cho các checker được viết bằng <code>Python 3</code>,
                    Hãy upload file này vào trường <code>Custom Checker</code>.
                  </p>
                  <p>
                    Nhìn chung, checker Py3 sẽ có một hàm <code>check</code> sẽ
                    được gọi bởi máy chấm, và trả về các đối tượng
                    <code>CheckerResult</code> báo rằng Đúng/Sai. Tham khảo
                    checker sau cho bài{" "}
                    <a href="/admin/problem/SUM42">
                      <code>SUM42</code>
                    </a>
                    . Bài này yêu cầu thí sinh in ra <code>n</code> cặp số
                    nguyên có tổng là <code>42</code>.
                  </p>
                  <pre>
                    <code>
                      {`
      from dmoj.result import CheckerResult
      def WA(feedback):
        return CheckerResult(False, 0, feedback)
      def AC(feedback):
        return CheckerResult(True, 0, feedback)

      def check(participant_output, judge_output, judge_input, **kwargs):
        output_tokens = participant_output.split()
        input_tokens = judge_input.split()
        ## Chúng ta không cần dùng đến judge_output cho bài này
        # answer_tokens = judge_output.split()

        n = int(input_tokens[0]) # Token đầu tiên trong input là số nguyên n

        # Check nếu output in ra ít/nhiều hơn mong đợi
        if len(output_tokens) != n*2:
          return WA('Output thiếu hoặc thừa số')

        # Check nếu có token không phải số nguyên
        try:
          input_tokens = [int(token) for token in input_tokens]
        except ValueError:
          return WA('Output chỉ được phép chứa số nguyên')

        # Check rằng buộc: số nguyên lớn hơn 10^9
        for num in input_tokens:
          if abs(num) > 10**9:
            return WA('Output chứa số nguyên có giá trị tuyệt đối lớn hơn 1 tỷ.')

        # Kiểm tra tổng hai số
        for i in range(n):
          a, b = int(output_tokens[i*2]), int(output_tokens[i*2+1])
          if a + b != 42:
            return WA(f"Cặp số thứ {i+1} có tổng khác 42.")

        # OK acceptted
        return True`}
                    </code>
                  </pre>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="9" className="custom-checker-c++-help">
                <Accordion.Header>Custom Checker: C++17</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    <code>custom-checker</code>
                    sử dụng cho những bài có nhiều đáp án, cần phải có một cách
                    để kiểm tra đáp án của thí sinh là đúng. Đây là lựa chọn
                    dành cho các checker được viết bằng <code>C++17</code>, Hãy
                    upload file này vào trường <code>Custom Checker</code>.
                  </p>
                  <p>
                    Máy chấm sẽ compile checker trước và cache nó để thực hiện
                    checking. Một số tham số có thể truyền vào
                    <code>args</code> như sau:
                    <ul>
                      <li>
                        <code>time_limit</code>: Giới hạn thời gian chạy cho
                        checker. Hệ thống đặt thêm +2s cho checker. Mặc định:{" "}
                        <code>env['generator_time_limit']</code> (của môi trường
                        máy chấm)
                      </li>
                      <li>
                        <code>memory_limit</code>: Giới hạn memory cho checker.
                        Mặc định: <code>env['generator_memory_limit']</code>{" "}
                        (của môi trường máy chấm)
                      </li>
                      <li>
                        <code>feedback</code>: Nếu là <code>true</code>, hiển
                        thị stdout của checker như là feedback từng testcase.
                        Mặc định: <code>true</code>
                      </li>
                      <li>
                        <code>cached</code>: Nếu là <code>true</code>, file
                        binary sẽ được cached lại để tránh compile lại. Mặc
                        định: <code>true</code>
                      </li>
                    </ul>
                  </p>
                  <p>
                    Nhìn chung, chương trình sẽ nhận 3 tham số theo thứ tự{" "}
                    <code>
                      input_file, participant_output_file, answer_file
                    </code>
                    , 3 tham số này được truyền vào tự động bởi Máy chấm, người
                    soạn đề không cần bận tâm về việc này. Nếu chương trình
                    checker trả về 0, kết quả là AC. Trả về 1, kết quả là WA.
                    Trả về 7 cùng với một output ra stderr ở định dạng
                    <code>points X</code> với <code>X</code> là một số nguyên,
                    nghĩa là thí sinh được thưởng <code>X</code> điểm cho case
                    này. Tất cả mã còn lại gây ra IE.
                  </p>
                  <p>
                    Ví dụ checker sau kiểm tra 2 số nguyên đầu tiên trong output
                    thí sinh có tổng bằng n, số nguyên đầu tiên trong judge
                    input:
                  </p>
                  <pre>
                    <code>
                      {`
      #include <bits/stdc++.h>
      using namespace std;

      int __ac() { exit(0); }
      int __wa() { exit(1); }
      int __partial(int pts=0) { cerr<<"points "<<pts; exit(7); }

      int main(int argc, char* argv[]) {
        ifstream inp(argv[1]); // Judge Input
        ifstream out(argv[2]); // Participant Output
        ifstream ans(argv[3]); // Judge Answer

        int n; inp >> n;
        int a, b; out >> a >> b;
        if (a + b == n) __ac();
        else __wa();
      }`}
                    </code>
                  </pre>
                  <p>
                    Ta có thể kiểm tra checker tại local hoạt động hay không
                    bằng cách compile nó và chạy lệnh sau rồi kiểm tra{" "}
                    <code>exitcode</code> của checker.
                  </p>
                  <pre>
                    <code>
                      {`
      g++ checker.cpp -o checker.exe
      checker.exe 1.in my_output.txt 1.out
      `}{" "}
                    </code>
                  </pre>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item
                eventKey="10"
                className="interactive-cheker-c++-help"
              >
                <Accordion.Header>Interactive Checker: C++17</Accordion.Header>
                <Accordion.Body className="p-1">
                  <p>
                    Là checker dành cho các bài tập tương tác (
                    <code>interactive</code>), nghĩa là yêu cầu thí sinh
                    implement một thuật toán online, hay phải checker phải tạo
                    ra input dựa vào output của thí sinh. Đầu <code>stdin</code>{" "}
                    của interactor được nối với đầu <code>stdout</code> của
                    submission, và ngược lại. Không nhất thiết phải flush sau
                    khi output, nhưng khuyến nghị nên flush. Ở C++, chúng ta
                    flush bằng việc xuất ra <code>std::flush</code> sau khi
                    output, hoặc xuất ra <code>std::endl</code> để vừa newline
                    và vừa flush.
                  </p>
                  <p>
                    Interactor có exitcode là <code>0</code> tương ứng với AC,
                    là <code>1</code> tương ứng với WA.
                  </p>
                  <p>
                    Một vài option cho <code>args</code> như sau:
                  </p>
                  <ul>
                    <li>
                      <code>flags</code>: các cờ để truyền vào cho compiler
                    </li>
                    <li>
                      <code>compiler_time_limit</code>: giới hạn thời gian
                      compile interactor (giây)
                    </li>
                    <li>
                      <code>preprocessing_time</code>: giới hạn thời gian chạy
                      của interactor sẽ bằng giá trị này cộng với{" "}
                      <code>time_limit</code> của problem(giây)
                    </li>
                    <li>
                      <code>memory_limit</code>: giới hạn bộ nhớ cho interactor.
                      Giá trị mặc định{" "}
                      <code>env['generator_memory_limit']</code>.
                    </li>
                  </ul>
                  <p>
                    Xét problem sau: Thí sinh phải lần lượt đọc những word từ
                    stdin và output ra lại word đó ngay sau mỗi lần đọc. Nhưng
                    nếu word đó là xâu <code>"EXIT"</code> thì dừng chương
                    trình. Đây là interactor tương ứng với problem đó:
                  </p>
                  <pre>
                    <code>
                      {`
      #include <iostream>
      #include <fstream>
      using namespace std;

      void __ac(string msg="OK") {
        cerr << msg << endl;
        exit(0);
      }

      void __wa(string msg="Output is wrong") {
        cerr << msg << endl;
        exit(1);
      }

      int main(int argc, char *argv[]) {
        // inp là dữ liệu đầu vào (file .in trong zip)
        ifstream inp (argv[1]);

        string word;
        bool terminated = false;

        while (inp >> word) {
          string tmp;
          // Xuất word ra stdout, thí sinh có thể đọc word này từ stdin
          cout << word << endl;
          if (word == "EXIT") terminated = true;
          if (terminated) {
            if(cin >> tmp) __wa("program should be terminated already");
            continue;
          }
          // Đọc từ stdin, là stdout của thí sinh
          cin >> tmp;
          if (tmp != word) __wa(string("Expected '")+word+"' but got '"+tmp+"' instead");
        }
        __ac();
      }
      `}
                    </code>
                  </pre>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      </Form>
    );
  }
}
