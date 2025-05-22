import apiClient from "../apiClient";

const PreApi = {
  getVisits: "/api/v1/visit/get-visits",
  getImage: "/api/v1/visit/get-image-url",
  updateVitals: "/api/v1/visit/update-vitals",
  updateCheckInOut: "/api/v1/visit/checkInOut",
  assign: "/api/v1/visit/assign",
  UnAssign: "/api/v1/visit/unassign",
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

const updateVitals = async (vitals) => {
  try {
    const response = await apiClient.post(`${PreApi.updateVitals}`, vitals, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return null;
  }
};

const updatecheckInOut = async (formData) => {
  try {
    const response = await apiClient.post(`${PreApi.updateCheckInOut}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return null;
  }
};

const assignPractToClient = async (clientId,practId,date) => {
  try {
    const response = await apiClient.post(
      `${PreApi.assign}`,
      {
        clientId,
        practId,
        date,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return null;
  }
};

const unAssignPractToClient = async (clientId, date) => {
  try {
    const response = await apiClient.post(
      `${PreApi.UnAssign}`,
      {
        clientId,
        date,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return null;
  }
};


export default {
  getVisits,
  getImageURL,
  updateVitals,
  updatecheckInOut,
  assignPractToClient,
  unAssignPractToClient,
};
