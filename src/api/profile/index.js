import axiosClient from "api/axiosClient";

const fetchProfile = () => {
    return axiosClient.get('/profile/');
}

const changePassword = (data) => {
    return axiosClient.post('/profile/change-password/', data);
}

const adminGetProfile = ({username}) => {
    return axiosClient.get(`/profile/${username}/`)
}

const adminEditProfile = ({username, data}) => {
    return axiosClient.patch(`/profile/${username}/`, data)
}

const ProfileAPI = {
    fetchProfile,
    changePassword,
    adminGetProfile,
    adminEditProfile,
}

export default ProfileAPI;
