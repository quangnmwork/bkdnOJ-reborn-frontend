import axiosClient from "api/axiosClient";
import axiosFormClient from "api/axiosFormClient";

const getProblems = ({params}) => {
  return axiosClient.get("/problem/", params && {params: {...params}});
};
const createProblem = ({data}) => {
  return axiosClient.post(`/problem/`, data);
};

const getProblemDetails = ({shortname}) => {
  return axiosClient.get(`/problem/${shortname}`);
};
const submitToProblem = ({shortname, data}) => {
  return axiosClient.post(
    `/problem/${shortname}/submit/`,
    JSON.stringify(data)
  );
};

const infoRejudgeProblem = ({shortname, params}) => {
  return axiosClient.get(
    `/problem/${shortname}/rejudge/`,
    params && {params: {...params}}
  );
};
const rejudgeProblem = ({shortname, data}) => {
  return axiosClient.post(
    `/problem/${shortname}/rejudge/`,
    JSON.stringify(data)
  );
};

const adminOptionsProblemDetails = ({shortname}) => {
  return axiosClient.options(`/problem/${shortname}/`);
};
const adminPostProblemFromZip = ({formData}) => {
  return axiosFormClient.post(`/problem-from-archive`, formData);
};
const adminDeleteProblem = ({shortname}) => {
  return axiosClient.delete(`/problem/${shortname}/`);
};
const adminEditProblemDetails = ({shortname, data}) => {
  return axiosClient.patch(`/problem/${shortname}/`, JSON.stringify(data));
};
const adminEditProblemDetailsForm = ({shortname, formData}) => {
  return axiosFormClient.patch(`/problem/${shortname}/`, formData);
};
const adminGetProblemDetailsData = ({shortname}) => {
  return axiosClient.get(`/problem/${shortname}/data/`);
};
const adminEditProblemDetailsData = ({shortname, data}) => {
  return axiosClient.patch(`/problem/${shortname}/data/`, JSON.stringify(data));
};
const adminEditProblemDataForm = ({shortname, formData}) => {
  return axiosFormClient.patch(`/problem/${shortname}/data/`, formData);
};
const adminGetProblemDetailsTest = ({shortname, params}) => {
  return axiosClient.get(
    `/problem/${shortname}/data/test/`,
    params && {params: {...params}}
  );
};

const problemAPI = {
  getProblems,
  createProblem,

  getProblemDetails,

  submitToProblem,

  infoRejudgeProblem,
  rejudgeProblem,

  adminOptionsProblemDetails,

  adminPostProblemFromZip,

  adminGetProblemDetailsData,
  adminGetProblemDetailsTest,

  adminDeleteProblem,

  adminEditProblemDetails,
  adminEditProblemDetailsForm,
  adminEditProblemDataForm,
  adminEditProblemDetailsData,
};

export default problemAPI;
