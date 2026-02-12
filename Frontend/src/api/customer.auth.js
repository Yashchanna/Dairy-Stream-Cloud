import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

export const registerCustomer = (data) =>
  API.post("/customer/addCustomer", data);
