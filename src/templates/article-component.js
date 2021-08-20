import * as React from "react"
import { graphql } from "gatsby"

export default function ArticleComponent(props) {
  return <div id="title">{props.data.nodeArticle.title}</div>
}

export const query = graphql`
  query ($id: String) {
    nodeArticle(id: { eq: $id }) {
      id
      title
    }
  }
`
