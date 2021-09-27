// const { run } = require(`shakespeares-monkeys`)
const { run } = require(`../monkey-engine/index.js`)
const got = require(`got`)
const { GlobalClient, Entity } = require(`drupal-jsonapi-client`)

// --user api:api \
// --header 'Accept: application/vnd.api+json' \
// --header 'Content-type: application/vnd.api+json' \
// --header 'Authorization:Basic YWRtaW46cGFzc3dvcmQ=' \
// --request POST https://dev-gatsby-drupal-stress-testing.pantheonsite.io/jsonapi/node/article \
// --data-binary @payload.json

// const drupalUrl = `https://dev-gatsby-drupal-stress-testing.pantheonsite.io/jsonapi/node/article`
// GlobalClient.baseUrl = `https://sc-api-dev.psu.edu/`
// const newEntity = new Entity(`node`, `story`)
// newEntity.setAttribute(`title`, `hi`)
// newEntity.setAttribute(`body`, { value: `drupal rocks` })
// console.log(newEntity)
// process.exit()

const drupalUrl = `https://sc-api-dev.psu.edu/jsonapi/node/external_resource`
// const authorization = `Basic YWRtaW46cGFzc3dvcmQ=`
const authorization = `Basic QVBJIFVzZXItR2F0c2J5Ojdyd29pLkNnRkpWb0ZiQ1p5YWNZVDJfWXhLITg5V01y`
// const type = `node--article`
const type = `node--external_resource`

async function updateOperator(node) {
  const uuid = node.id
  const newValue = Math.random().toString().replace(`.`, ``)
  const drupalUrl = `https://sc-api-dev.psu.edu/jsonapi/node/story`
  console.log({ uuid, newValue })

  try {
    await got.patch(`${drupalUrl}/${uuid}`, {
      headers: {
        Accept: `application/vnd.api+json`,
        "Content-type": `application/vnd.api+json`,
        Authorization: authorization,
        "api-key": `9aa4caa945a0a37fcb98ce4d537c0e30`,
      },
      responseType: `json`,
      json: {
        data: {
          type: `node--article`,
          id: uuid,
          attributes: {
            title: newValue,
          },
        },
      },
    })
  } catch (e) {
    console.log(e.response.body)
  }

  return {
    pagePath: `/research/story/${newValue}/`,
    selector: `article h1`,
    value: newValue,
  }
}

async function createOperator(id) {
  const newValue = Math.random()
  let res
  try {
    await got.post(drupalUrl, {
      headers: {
        Accept: `application/vnd.api+json`,
        "Content-type": `application/vnd.api+json`,
        Authorization: authorization,
        "api-key": `9aa4caa945a0a37fcb98ce4d537c0e30`,
      },
      responseType: `json`,
      json: {
        data: {
          type,
          attributes: {
            title: `${newValue}`,
            body: {
              value: `Custom value`,
              // format: `plain_text`,
            },
            field_url: [
              {
                uri: `https://example.com`,
              },
            ],
          },
        },
      },
    })
  } catch (e) {
    console.log(
      `request error`,
      e.message,
      JSON.stringify(e.response.body, null, 4)
    )
  }

  // await got.post(`http://localhost:8000/__refresh`)

  console.log(res.body)
  const nodeId = res.body.data.id

  return {
    pagePath: `/${id}`,
    selector: `#title`,
    value: newValue,
    context: {
      drupalId: nodeId,
    },
  }
}

async function deleteOperator(node) {
  await got.delete(`${drupalUrl}${node.context.drupalId}`, {
    headers: {
      Accept: `application/vnd.api+json`,
      "Content-type": `application/vnd.api+json`,
      Authorization: authorization,
      "api-key": `9aa4caa945a0a37fcb98ce4d537c0e30`,
    },
  })

  // await got.post(`http://localhost:8000/__refresh`)
}

const devConfig = {
  rootUrl: `http://localhost:8000`,
  operators: {
    create: createOperator,
    delete: deleteOperator,
  },
  operationsLimit: 10,
  interval: 4,
}

const prodConfig = {
  rootUrl: `https://drupalgatsbyintegrationtestmai.gatsbyjs.io/`,
  operators: {
    create: createOperator,
    delete: deleteOperator,
  },
  operationsLimit: 2,
  interval: 5,
}

const psuConfig = {
  rootUrl: `https://scnewsdev.gatsbyjs.io/news`,
  operators: {
    // create: createOperator,
    // delete: deleteOperator,
    update: updateOperator,
  },
  nodePool: [
    {
      id: `28c48792-a97c-4bf7-a1d9-e91794c47de5`,
    },
    {
      id: `7a450b96-d8f6-4bda-903e-aed8189babec`,
    },
    {
      id: `dd3e157a-f528-476a-91d1-4a71d6fd643a`,
    },
    {
      id: `d6eb0987-5147-49b6-b158-1429bcf138f6`,
    },
    {
      id: `c3277da1-d466-4418-afb4-1dadfec4658c`,
    },
    {
      id: `9937257e-4396-42c6-bd6b-aadbcc8dbc33`,
    },
    {
      id: `8152a55f-adb6-45b2-812f-e551b8d111e5`,
    },
    {
      id: `fda1635c-2c58-497e-9ee1-d0756a26a702`,
    },
    {
      id: `0c2cb403-0ca0-4b35-a9e8-32bc9936cc86`,
    },
  ],
  operationsLimit: 1000,
  interval: 30,
}

run(psuConfig, (state) => {
  console.log(`event: `, state.event.type)
  if (state.changed) {
    console.log(
      state.value,
      `latencies`,
      state.context.operations
        .filter((op) => op.state.value === `completed`)
        .map((op) => op.state.context.latency)
        .join(`\n`),
      state.context.operations
        .filter((op) => op.state.value !== `completed`)
        .map((op) => {
          return {
            value: op.state.value,
            id: op.state.context.id,
            pagePath: op.state.context.node?.id,
            checkCount: op.state.context.checkCount,
          }
        }),
      `nodes`,
      Object.values(state.context.nodes)
        .filter((n) => n.inFlight)
        .map((n) => {
          return {
            pagePath: n.pagePath,
            inFlight: n.inFlight,
            existsOnCMS: n.existsOnCMS,
            published: n.published,
          }
        })
    )
  }

  if (state.value === `done`) {
    console.log(
      `latencies`,
      state.context.operations.map((op) => op.state.context.latency).join(`\n`)
    )
  }
})
