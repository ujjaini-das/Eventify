import axios from "axios";
const API_URL = "https://eventify-1ul1.onrender.com/api/events";

export const getEvents = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};