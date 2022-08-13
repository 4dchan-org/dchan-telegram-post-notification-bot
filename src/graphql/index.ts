import { request } from 'graphql-request'
import POSTS_GET_LAST from "./queries/posts_get_last";
import Config from '../services/config';

async function getLatestPosts() {
  return request(Config.subgraph.endpoint, POSTS_GET_LAST)
}

export {
  getLatestPosts
}