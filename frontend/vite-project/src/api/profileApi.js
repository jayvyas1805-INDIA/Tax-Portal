import apiClient from "./apiClient";

export const getProfile = async () => {
  const { data } = await apiClient.get("/partner/profile");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.put("/partner/profile", payload);
  return data;
};

export const uploadProfilePhoto = async (file) => {

    const formData = new FormData();

    formData.append("profileImage", file);

    const { data } = await apiClient.patch(
        "/partner/profile/photo",
        formData,
        {
            headers: {
                "Content-Type":"multipart/form-data"
            }
        }
    );

    return data;
};

export const getProfileCompletion = async () => {
  const { data } = await apiClient.get("/partner/profile/profile-completion");
  return data;
};