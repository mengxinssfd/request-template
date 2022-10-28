import axios from 'axios';
import { AxiosRequestTemplate } from '@request-template/axios';

AxiosRequestTemplate.useAxios(axios);

export const ins = new AxiosRequestTemplate();
