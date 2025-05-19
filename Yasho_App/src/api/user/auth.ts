import apiClient from "../apiClient";


const PreApi = {
  login: "/api/v1/user/login",
  me:"/api/v1/user/me",
  register:"/api/v1/user/register"
};

const login = async (mobile:any, password:any) => {
  try {
    const response = await apiClient.post(
      `${PreApi.login}`,
      { mobile, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    localStorage.setItem("yasho",response.data.data.token)
    return response.data;
  } catch (error) {
    console.error("Error fetching login:", error);
    return null;
  }
};

const getMe = async () => {
  try {
    const response = await apiClient.get(`${PreApi.me}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching login:", error);
    return null;
  }
};

const register = async (name:any,email:any,mobile: any, password: any) => {
  try {
    const response = await apiClient.post(
      `${PreApi.register}`,
      { name, email,mobile,password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching login:", error);
    return null;
  }
};

export default {
  login,
  getMe,
  register,
};
  