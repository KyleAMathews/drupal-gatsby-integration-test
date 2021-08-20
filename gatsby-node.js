const path = require(`path`)

exports.createPages = async function ({ graphql, actions }) {
  const { createPage } = actions
  const data = await graphql(
    `
      {
        allNodeArticle {
          nodes {
            id
            field_chaos_id
          }
        }
      }
    `
  )
  const articleComponent = path.resolve(`./src/templates/article-component.js`)
  data.data.allNodeArticle.nodes.forEach((node, i) => {
    createPage({
      path: `/${node.field_chaos_id}`,
      component: articleComponent,
      context: { id: node.id },
    })
  })
}
