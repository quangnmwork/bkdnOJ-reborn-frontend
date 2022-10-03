import axiosClient from "api/axiosClient";
import axiosFormClient from "api/axiosFormClient";

const getUsers = ({ params }) => {
    return axiosClient.get('/users/', (params && { params: {...params} }));
}
const getUser = ({username}) => {
    return axiosClient.get(`/user/${username}/`);
}

const adminEditUser = ({username, data}) => {
    return axiosClient.patch(`/user/${username}/`, data);
}

const adminActOnUsers = (payload) => {
    return axiosClient.post(`/users/act/`, payload);
}

const adminDeleteUser = ({username}) => {
    return axiosClient.delete(`/user/${username}/`);
}

const adminGenUserFromCSV = ({formData}) => {
    return axiosFormClient.post(`/users/generate/csv/`, formData)
}

const adminResetPassword = ({username, data}) => {
    return axiosClient.post(`/user/${username}/reset-password/`, data);
}

const userAPI = {
    getUsers,
    getUser,
    adminActOnUsers,
    adminGenUserFromCSV,
    adminEditUser,
    adminDeleteUser,
    adminResetPassword,
}

export default userAPI;
