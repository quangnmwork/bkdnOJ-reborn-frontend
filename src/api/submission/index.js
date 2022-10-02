import axiosClient from "api/axiosClient";

const getSubmissions = params => {
  return axiosClient.get("/submission/", params && {params: {...params}});
};

const rejudgeSubmissions = params => {
  return axiosClient.patch(
    "/submission/",
    null,
    params && {params: {...params}}
  );
};

const getSubmissionDetails = ({id, params}) => {
  return axiosClient.get(`/submission/${id}/`, params && {params: {...params}});
};

const adminRejudgeSubmission = ({id}) => {
  return axiosClient.post(`/submission/${id}/rejudge/`);
};
const adminDeleteSubmission = ({id}) => {
  return axiosClient.delete(`/submission/${id}/`);
};
const getSubmissionResult = ({id}) => {
  return axiosClient.get(`/submission/${id}/testcase`);
};
const getSubmissionResultCase = ({id, case_num}) => {
  return axiosClient.get(`/submission/${id}/testcase/${case_num}`);
};

const submissionApi = {
  getSubmissions,
  rejudgeSubmissions,

  getSubmissionDetails,
  getSubmissionResult,
  getSubmissionResultCase,

  adminRejudgeSubmission,
  adminDeleteSubmission,
};

export default submissionApi;
