import * as React from "react"
import { graphql } from "gatsby"

export default function PageComponent(props) {
  return (
    <div>
      <div id="title">{props.data.nodePage.title}</div>
      <div>{props.data.nodePage.body?.processed}</div>
    </div>
  )
}

export const query = graphql`
  query ($id: String) {
    nodePage(id: { eq: $id }) {
      id
      title
      body {
        processed
      }
    }
  }
`
