import apiClient from "../apiClient";

const PreApi = {
  getVisits: "/api/v1/visit/get-visits",
  getImage: "/api/v1/visit/get-image-url",
};


const getVisits = async () => {
  try {
    const response = await apiClient.get(`${PreApi.getVisits}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Visits:", error);
    return null;
  }
};

const getImageURL = async (visits) => {
  try {
    const response = await apiClient.post(`${PreApi.getImage}`, visits);
    return response.data;
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return null;
  }
};


export default {
  getVisits,
  getImageURL,
};
