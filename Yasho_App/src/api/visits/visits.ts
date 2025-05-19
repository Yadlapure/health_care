import apiClient from "../apiClient";

const PreApi = {
  getVisits: "/api/v1/visit/get-visits",
};


const getVisits = async () => {
  const token = localStorage.getItem("yasho");
  if (!token) return null;
  try {
    const response = await apiClient.get(`${PreApi.getVisits}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Visits:", error);
    return null;
  }
};

export default {
  getVisits,
};
