import React from "react";
import {toast} from "react-toastify";
import ReactPaginate from "react-paginate";
import {Link} from "react-router-dom";
import {Button, Table, Form, Modal} from "react-bootstrap";

import {FaRegFileArchive, FaQuestionCircle} from "react-icons/fa";
import {
  AiOutlineForm,
  AiOutlineArrowRight,
  AiOutlinePlusCircle,
} from "react-icons/ai";

import {SpinLoader, ErrorBox, FileUploader} from "components";
import ProblemSearchForm from "./ProblemSearchForm";
import problemApi from "api/problem";

import {setTitle} from "helpers/setTitle";
import {qmClarify} from "helpers/components";
import {withNavigation} from "helpers/react-router";
import {getYearMonthDate, getHourMinuteSecond} from "helpers/dateFormatter";

import "./AdminProblemList.scss";
import "styles/ClassicPagination.scss";

class ProblemListItem extends React.Component {
  static formatDateTime(date) {
    const d = new Date(date);
    return (
      <div className="flex-center-col">
        <div style={{fontSize: "10px"}}>{getYearMonthDate(d)}</div>
        <div style={{fontSize: "12px"}}>{getHourMinuteSecond(d)}</div>
      </div>
    );
  }

  render() {
    const {
      shortname,
      title,
      points,
      short_circuit,
      partial,
      is_public,
      is_organization_private,
      modified,
    } = this.props;
    const {rowidx, selectChk, onSelectChkChange} = this.props;

    const visible = is_public
      ? is_organization_private
        ? "Orgs"
        : "Public"
      : "Private";

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "80px"}}>
          <Link to={`/admin/problem/${shortname}`}>{shortname}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "200px"}}>
          <Link to={`/admin/problem/${shortname}`}>{title}</Link>
        </td>
        <td>{points}</td>
        <td>{visible}</td>
        <td>{short_circuit ? "Yes" : "No"}</td>
        <td>{partial ? "Yes" : "No"}</td>
        <td>{modified ? ProblemListItem.formatDateTime(modified) : "n/a"}</td>
        <td>
          <input
            type="checkbox"
            value={selectChk[rowidx]}
            onChange={() => onSelectChkChange(rowidx)}
          />
        </td>
      </tr>
    );
  }
}

export const PROBLEM_INITIAL_FILTER = {
  search: "",
  is_public: "",
  is_organization_private: "",
  partial: "",
  short_circuit: "",
  ordering: "-created",
};

class AdminProblemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchData: PROBLEM_INITIAL_FILTER,

      problems: [],
      count: 0,

      selectChk: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      selectedZip: null,
      submitting: false,

      newModalShow: false,
      helpModalShow: false,
    };
    setTitle("Admin | Problems");
  }

  setSelectedZip(zip) {
    this.setState({selectedZip: zip});
  }

  selectChkChangeHandler(idx) {
    const {selectChk} = this.state;
    if (idx >= selectChk.length) console.log("Invalid delete tick position");
    else {
      const val = selectChk[idx];
      this.setState({
        selectChk: selectChk
          .slice(0, idx)
          .concat(!val, selectChk.slice(idx + 1)),
      });
    }
  }

  callApi(params) {
    this.setState({loaded: false, errors: null});
    const searchData = this.state.searchData;

    problemApi
      .getProblems({params: {page: params.page + 1, ...searchData}})
      .then(res => {
        this.setState({
          problems: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
          loaded: true,
          selectChk: Array(res.data.results.length).fill(false),
        });
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors:
            err.response.data || "Cannot fetch problems. Please retry again.",
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchData !== this.state.searchData) {
      this.callApi({page: this.state.currPage});
    }
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  handleDeleteSelect(e) {
    e.preventDefault();

    let names = [];
    this.state.selectChk.forEach((v, i) => {
      if (v) names.push(this.state.problems[i].shortname);
    });

    if (names.length === 0) {
      alert("Không có bài tập nào đang được chọn.");
      return;
    }

    // TODO: Write a bulk delete API for problems
    const conf = window.confirm(
      "Xóa các bài tập " + JSON.stringify(names) + "?"
    );
    if (conf) {
      let reqs = [];
      names.forEach(shortname => {
        reqs.push(problemApi.adminDeleteProblem({shortname}));
      });

      Promise.all(reqs)
        .then(() => {
          toast.success("OK Deleted.");
          this.callApi({page: this.state.currPage});
        })
        .catch(err => {
          let msg = "Không thể xóa các problem này.";
          if (err.response) {
            if (err.response.status === 405)
              msg += " Phương thức chưa được implemented.";
            if (err.response.status === 404)
              msg =
                "Không tìm thấy một trong số Problem được chọn. Có lẽ chúng đã bị xóa?";
            if ([403, 401].includes(err.response.status))
              msg += " Có một vài Problem được chọn mà bạn không có quyền.";
          }
          this.setState({errors: [msg]});
        });
    }
  }

  newModalToggle(bool) {
    this.setState({newModalShow: bool});
  }
  helpModalToggle(bool) {
    this.setState({helpModalShow: bool});
  }

  render() {
    const {selectedZip, submitting} = this.state;

    return (
      <div className="admin admin-problems ">
        {/* Options for Admins: Create New,.... */}
        <div className="admin-options wrapper-vanilla m-0 mb-1">
          <div className="border d-inline-flex p-1">
            <Button
              size="sm"
              variant="dark"
              className="btn-svg"
              onClick={() => this.setState({newModalShow: true})}
            >
              <AiOutlinePlusCircle />
              <span className="d-none d-md-inline-flex">Add (Form)</span>
              <span className="d-inline-flex d-md-none">
                <AiOutlineArrowRight />
                <AiOutlineForm />
              </span>
            </Button>
          </div>

          <div className="border d-inline-flex p-1">
            <FileUploader
              onFileSelectSuccess={file => this.setSelectedZip(file)}
              onFileSelectError={({error}) => alert(error)}
            />
            <Button
              disabled={submitting}
              onClick={() => {
                if (!selectedZip) alert("Please select a .zip file.");
                else {
                  this.setState({submitting: true}, () => {
                    const formData = new FormData();
                    formData.append("archive", selectedZip);
                    problemApi
                      .adminPostProblemFromZip({formData})
                      .then(() => {
                        toast.success("Đã tạo Problem mới thành công.");
                        this.callApi({page: this.state.currPage});
                      })
                      .catch(err => {
                        const data = err.response.data;
                        this.setState({errors: data});
                      })
                      .finally(() => this.setState({submitting: false}));
                  });
                }
              }}
              size="sm"
              variant="dark"
              className="btn-svg"
            >
              <AiOutlinePlusCircle />
              <span className="d-none d-md-inline-flex">Add (upload Zip)</span>
              <span className="d-inline-flex d-md-none">
                <AiOutlineArrowRight />
                <FaRegFileArchive />
              </span>
            </Button>

            <Button
              className="btn-svg btn-light ml-1"
              onClick={() => this.helpModalToggle(true)}
            >
              <FaQuestionCircle size={20} color="red" />
            </Button>
          </div>
          <div className="admin-note flex-center text-center mb-1">
            {submitting && (
              <span className="loading_3dot">Đang xử lý yêu cầu</span>
            )}
          </div>
        </div>

        {/* Problem List */}
        <div className="admin-table problem-table wrapper-vanilla">
          <ProblemSearchForm
            searchData={this.state.searchData}
            setSearchData={dat => this.setState({searchData: dat})}
          />

          <h4>Problem List</h4>
          <ErrorBox errors={this.state.errors} />
          <Table
            responsive
            hover
            size="sm"
            striped
            bordered
            className="rounded"
          >
            <thead>
              <tr>
                <th style={{width: "20%"}}>#</th>
                <th style={{minWidth: "30%", maxWidth: "30%"}}>Title</th>
                <th style={{width: "12%"}}>Points</th>
                <th style={{width: "10%"}}>
                  Visible
                  {qmClarify(
                    "Cho biết Problem này đang ở chế độ hiển thị nào.\n" +
                      "* Public: mọi người đều thấy\n* Orgs: Chỉ một vài tổ chức thấy được.\n" +
                      "* Private: Chỉ các cá nhân được thêm mới thấy được."
                  )}
                </th>
                <th style={{width: "10%"}}>
                  ICPC
                  {qmClarify(
                    "Chạy bài ở chế độ ICPC, nghĩa là một test sai sẽ dừng quá trình chấm bài."
                  )}
                </th>
                <th>
                  Điểm thành phần
                  {qmClarify("Cho phép thí sinh ăn điểm với mỗi test đúng.")}
                </th>
                <th>Modified Date</th>
                <th style={{width: "8%"}}>
                  <Link to="#" onClick={e => this.handleDeleteSelect(e)}>
                    Delete
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.loaded === false ? (
                <tr>
                  <td colSpan="99">
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              ) : this.state.count > 0 ? (
                this.state.problems.map((prob, idx) => (
                  <ProblemListItem
                    key={`prob-${prob.shortname}`}
                    rowidx={idx}
                    {...prob}
                    selectChk={this.state.selectChk}
                    onSelectChkChange={i => this.selectChkChangeHandler(i)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="99">
                    <em>No Submission be found.</em>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          {this.state.loaded === false ? (
            <SpinLoader margin="0" />
          ) : (
            <span className="classic-pagination">
              Page:{" "}
              <ReactPaginate
                breakLabel="..."
                onPageChange={this.handlePageClick}
                forcePage={this.state.currPage}
                pageLabelBuilder={page => `[${page}]`}
                pageRangeDisplayed={3}
                pageCount={this.state.pageCount}
                renderOnZeroPageCount={null}
                previousLabel={null}
                nextLabel={null}
              />
            </span>
          )}
        </div>

        <NaviNewProb
          show={this.state.newModalShow}
          toggle={b => this.newModalToggle(b)}
        />
        <HelpModal
          show={this.state.helpModalShow}
          toggle={b => this.helpModalToggle(b)}
        />
      </div>
    );
  }
}

class NewProblemModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shortname: "",
      errors: null,
    };
  }
  onSubmit(e) {
    e.preventDefault();
    this.setState({errors: null});

    problemApi
      .createProblem({data: {shortname: this.state.shortname}})
      .then(res => {
        toast.success("OK Created.");
        this.props.navigate(`/admin/problem/${res.data.shortname}`);
      })
      .catch(err => {
        console.log(err);
        this.setState({errors: err.response.data});
      });
  }
  close() {
    this.setState({errors: null});
    this.props.toggle(false);
  }

  render() {
    const {show} = this.props;
    return (
      <Modal show={show} onHide={() => this.close()}>
        <Modal.Header>
          <Modal.Title>+ Create Problem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorBox errors={this.state.errors} />
          <div>Problem Code</div>
          <Form.Control
            type="text"
            id="problem-shortname"
            placeholder="Problem Code"
            value={this.state.shortname}
            onChange={e => this.setState({shortname: e.target.value})}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => this.close()}>
            Đóng
          </Button>
          <Button variant="dark" onClick={e => this.onSubmit(e)}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
const NaviNewProb = withNavigation(NewProblemModal);

class HelpModal extends React.Component {
  close() {
    this.props.toggle(false);
  }

  render() {
    const {show} = this.props;
    return (
      <Modal show={show} onHide={() => this.close()} size="lg">
        <Modal.Header>
          <Modal.Title>Hướng dẫn tạo mới Problem bằng upload Zip</Modal.Title>
          <em>Cập nhập ngày (26/7/2022)</em>
        </Modal.Header>
        <Modal.Body>
          Để tự động hóa quá trình tạo mới Problem chỉ bằng thao tác upload Zip,
          file Zip của bạn cần phải có những tệp tin sau:
          <ul>
            <li>
              Những cặp file <code>(a/b/xxx.in), (a/b/xxx.out)</code>. Hệ thống
              sẽ tự tìm những file này để set làm một cặp input/output, phân
              biệt chúng bằng path đến file đó<code>a/b/xxx</code>. Cụ thể những
              file nào được xét làm input, output, hãy xem file cấu hình ở
              backend <code>bkdnoj/settings.py</code>
            </li>
            <li>
              Một file <code>problem.pdf</code> để làm đề. Cụ thể file nào được
              xét làm PDF, hãy xem file cấu hình ở backend{" "}
              <code>bkdnoj/settings.py</code>
            </li>
            <li>
              <p>
                Một file cấu hình <code>problem.ini</code> để làm tự động set
                các thuộc tính của Problem. Cụ thể, file là những dòng có định
                dạng <code>KEY = VALUE</code>, có thể bắt đầu bằng dấu{" "}
                <code>;</code> để comment dòng đó lại. Ví dụ:
              </p>
              <pre className="border">
                <code>
                  {`; Đây là comment
code = ProblemA
name = Tiêu đề Problem A

; Optional
time_limit = 2.5
memory_limit = 250000
allow_submit = 1

icpc=1`}
                </code>
              </pre>
              <p>Các thuộc tính sẽ như sau:</p>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Các key</th>
                    <th>Kiểu value</th>
                    <th>Thuộc tính tương ứng</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>['shortname', 'code', 'codename', 'probid']</code>
                    </td>
                    <td>
                      String ký tự chữ, số và <code>-_</code>.
                    </td>
                    <td>
                      <code>shortname</code>
                    </td>
                    <td>Code định danh Problem</td>
                  </tr>
                  <tr>
                    <td>
                      <code>
                        ['name', 'title', 'problem', 'code', 'codename']
                      </code>
                    </td>
                    <td>String</td>
                    <td>
                      <code>title</code>
                    </td>
                    <td>Tiêu đề Problem</td>
                  </tr>
                  <tr>
                    <td>
                      <code>['time_limit', 'timelimit', 'time', 'tl']</code>
                    </td>
                    <td>Số thực</td>
                    <td>
                      <code>time_limit</code>
                    </td>
                    <td>
                      Giới hạn thời gian đơn vị giây. Nếu không có mặc định là{" "}
                      <code>1.0</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>
                        ['memory_limit', 'memorylimit', 'mem_limit', 'memlimit',
                        'memory', 'mem', 'ml']
                      </code>
                    </td>
                    <td>Số nguyên</td>
                    <td>
                      <code>memory_limit</code>
                    </td>
                    <td>
                      Giới hạn bộ nhớ đơn vị KB. Mặc định: <code>262144</code>{" "}
                      (256MB).
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>['short_circuit', 'skip_non_ac', 'icpc']</code>
                    </td>
                    <td>0, 1</td>
                    <td>
                      <code>short_circuit</code>
                    </td>
                    <td>
                      Dừng chấm nếu có test sai. Mặc định <code>0</code>.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>['partial', 'allow_partial', 'ioi']</code>
                    </td>
                    <td>0, 1</td>
                    <td>
                      <code>partial</code>
                    </td>
                    <td>
                      Cho phép ăn điểm từng test đúng. Mặc định <code>0</code>.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>['is_public', 'public']</code>
                    </td>
                    <td>0, 1</td>
                    <td>
                      <code>is_public</code>
                    </td>
                    <td>
                      Cho phép User bình thường nhìn thấy và nộp bài. Mặc định:{" "}
                      <code>0</code>.
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                Cụ thể file nào được xét để chọn làm file <code>.ini</code>, hãy
                xem file cấu hình ở backend <code>bkdnoj/settings.py</code>
              </p>
            </li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => this.close()}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default AdminProblemList;
