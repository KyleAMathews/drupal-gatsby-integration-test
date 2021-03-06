const path = require(`path`)

exports.createPages = async function ({ graphql, actions }) {
  const { createPage } = actions
  const data = await graphql(
    `
      {
        allNodeArticle {
          nodes {
            id
          }
        }
      }
    `
  )
  const articleComponent = path.resolve(`./src/templates/article-component.js`)
  console.log(`articles length`, data.data.allNodeArticle.nodes.length)
  data.data.allNodeArticle.nodes.forEach((node) => {
    createPage({
      path: `/${node.id}`,
      component: articleComponent,
      context: { id: node.id },
    })
  })

  const pageData = await graphql(
    `
      {
        allNodePage {
          nodes {
            id
          }
        }
      }
    `
  )

  const pageComponent = path.resolve(`./src/templates/page-component.js`)
  pageData.data.allNodePage.nodes.forEach((node) => {
    createPage({
      path: `/page/${node.id}`,
      component: pageComponent,
      context: { id: node.id },
    })
  })
}
