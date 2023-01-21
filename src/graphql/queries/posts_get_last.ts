import { gql } from "graphql-request";
import POST_FRAGMENT from "../fragments/post";

const POSTS_GET_LAST = gql`
  ${POST_FRAGMENT}

  query PostsGetLast {
    posts(orderBy: createdAt, orderDirection: desc, first: 10, where: {sage: false}) {
      ...Post
    }
  }
`;

export default POSTS_GET_LAST;
