import axios from 'axios';

const API_BASE_URL = process.env.BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});
