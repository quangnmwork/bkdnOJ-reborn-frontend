import React from 'react';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';

import { SpinLoader, ErrorBox } from 'components';
import problemApi from 'api/problem';


import './Problem.scss'
import 'styles/ClassicPagination.scss';

class ProblemListItem extends React.Component {
  render() {
    const {shortname, title, solved_count, attempted_count, points} = this.props;
    return (
      <tr>
        <td>
          <Link to={`/problem/${shortname}`}>{shortname}</Link>
        </td>
        <td>
          <Link to={`/problem/${shortname}`}>{title}</Link>
        </td>
        <td>{points}</td>
        <td>{solved_count}</td>
        <td>{attempted_count === 0 ? '?' : `${(solved_count*100.0/attempted_count).toFixed(2)}%`}</td>
        <td>
          <Link to={`/problem/${shortname}/submit`}><FaPaperPlane/></Link>
        </td>
      </tr>
    )
  }
}

class ProblemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problems: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,
    }
  }

  callApi(params) {
    this.setState({loaded: false, errors: null})

    problemApi.getProblems({page: params.page+1})
      .then((res) => {
        this.setState({
          problems: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
          loaded: true,
        })
      })
      .catch((err) => {
        this.setState({
          loaded: true,
          errors: ["Cannot fetch problems. Please retry again."],
        })
      })
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }

  handlePageClick = (event) => {
    this.callApi({page: event.selected});
  }

  render() {
    return (
      <div className="problem-table">
        <h4>Problem Set</h4>
        <ErrorBox errors={this.state.errors} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th>#</th>
              <th style={{width: "30%"}}>Title</th>
              <th>Points</th>
              <th>Solved</th>
              <th>AC%</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.loaded === false
                ? <tr><td colSpan="6"><SpinLoader margin="10px" /></td></tr>
                : this.state.problems.map((prob, idx) => <ProblemListItem
                    key={`prob-${prob.shortname}`}
                    rowid={idx} {...prob}
                  />)
            }
          </tbody>
          <tfoot className="problem-table-footer">
            <tr><td colSpan="6">
            {
              this.state.loaded === false
                ? <SpinLoader margin="0" />
                : <span className="classic-pagination">Page: <ReactPaginate 
                    breakLabel="..."
                    onPageChange={this.handlePageClick}
                    forcePage={this.state.currPage}
                    pageLabelBuilder={(page) => `[${page}]`}
                    pageRangeDisplayed={3}
                    pageCount={this.state.pageCount}
                    renderOnZeroPageCount={null}
                    previousLabel={null}
                    nextLabel={null}
                    /></span>
            }
            </td></tr>
          </tfoot>
        </Table>
      </div>
    )
  }
}

export {
  ProblemList,
}