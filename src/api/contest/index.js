import axiosClient from "api/axiosClient";

const getContests = (params) => {
    return axiosClient.get('/contest/', (params && { params: {...params} }));
}
const getAllContests = (params) => {
    return axiosClient.get('/all-contest/', (params && { params: {...params} }));
}
const getPastContests = (params) => {
    return axiosClient.get('/past-contest/', (params && { params: {...params} }));
}

const getContest = ({ key }) => {
    return axiosClient.get(`/contest/${key}/`);
}
const joinContest = ({ key }) => {
    return axiosClient.post(`/contest/${key}/participate/`);
}
const leaveContest = ({ key }) => {
    return axiosClient.post(`/contest/${key}/leave/`);
}
const getContestStanding = ({ key, params }) => {
    return axiosClient.get(`/contest/${key}/standing/`, (params && { params: {...params} }));
}

const recomputeContestStanding = ({ key, params }) => {
    return axiosClient.post(`/contest/${key}/standing/recompute/`, (params && { params: {...params} }));
}

const getContestParticipations = ({ key, params }) => {
    return axiosClient.get(`/contest/${key}/participations/`, (params && { params: {...params} }));
}

const addContestParticipations = ({ key, data }) => {
    return axiosClient.post(`/contest/${key}/participations/add/`, data);
}

const actContestParticipation = ({ key, data }) => {
    if (!('action' in data)) throw "Expect 'action' in body";
    if (!('data' in data)) throw "Expect 'data' in body";
    return axiosClient.post(`/contest/${key}/participations/action/`, data);
}

const getContestSubmissions = ({ key, params }) => {
    return axiosClient.get(`/contest/${key}/submission/`, (params && { params: {...params} }));
}

const rejudgeContestSubmissions = ({ key, params }) => {
    return axiosClient.patch(`/contest/${key}/submission/`, null, (params && { params: {...params} }));
}

const getContestProblems = ({ key, params }) => {
    return axiosClient.get(`/contest/${key}/problem/`, (params && { params: {...params} }));
}

const updateContestProblems = ({ key, data }) => {
    return axiosClient.post(`/contest/${key}/problem/`, data); // actually patching
}


const getContestProblem = ({ key, shortname, params }) => {
    return axiosClient.get(`/contest/${key}/problem/${shortname}/`, (params && { params: {...params} }));
}

const submitContestProblem = ({ key, shortname, data }) => {
    return axiosClient.post(`/contest/${key}/problem/${shortname}/submit/`, JSON.stringify(data) );
}

const getContestParticipants = ({ key }) => {
    return axiosClient.get(`/contest/${key}/participants/?view_full=1`);
}

const infoRejudgeContestProblem = ({ key, shortname, params}) => {
    return axiosClient.get(`/contest/${key}/problem/${shortname}/rejudge/`, (params && { params: {...params} }));
}
const rejudgeContestProblem = ({ key, shortname, data }) => {
    return axiosClient.post(`/contest/${key}/problem/${shortname}/rejudge/`, JSON.stringify(data));
}

const getContestProblemSubmissions = ({ key, shortname, params }) => {
    return axiosClient.get(`/contest/${key}/problem/${shortname}/submission/`, (params && { params: {...params} }));
}
const getContestProblemSubmission = ({ key, shortname, id }) => {
    return axiosClient.get(`/contest/${key}/problem/${shortname}/submission/${id}/`);
}

const infoRateContest = ({key}) => {
    return axiosClient.get(`/contest/${key}/rate/`, );
}
const rateContest = ({key, data}) => {
    return axiosClient.post(`/contest/${key}/rate/`, data);
}

const createContest = ({data}) => {
    return axiosClient.post(`/contest/`, data);
}

const deleteContest = ({ key }) => {
    return axiosClient.delete(`/contest/${key}/`);
}
const updateContest = ({ key, data }) => {
    return axiosClient.patch(`/contest/${key}/`, data);
}

const contestAPI = {
    getAllContests,
    getContests, getPastContests, getContest,

    joinContest, leaveContest,

    getContestStanding, recomputeContestStanding,
    getContestSubmissions, rejudgeContestSubmissions,

    // Participations
    getContestParticipations, addContestParticipations,
    actContestParticipation,

    getContestParticipants,

    // ContestProblem
    getContestProblems, getContestProblem, submitContestProblem,
    updateContestProblems,

    // Rejudge
    infoRejudgeContestProblem, rejudgeContestProblem,

    // Rating
    infoRateContest, rateContest,

    getContestProblemSubmissions, getContestProblemSubmission,

    createContest, deleteContest, updateContest,
}

export default contestAPI;
