const { run } = require(`shakespeares-monkeys`)
const got = require(`got`)

// --user api:api \
// --header 'Accept: application/vnd.api+json' \
// --header 'Content-type: application/vnd.api+json' \
// --header 'Authorization:Basic YWRtaW46cGFzc3dvcmQ=' \
// --request POST https://dev-gatsby-drupal-stress-testing.pantheonsite.io/jsonapi/node/article \
// --data-binary @payload.json

async function createOperator(id) {
  const newValue = Math.random()
  const res = await got.post(
    `https://dev-gatsby-drupal-stress-testing.pantheonsite.io/jsonapi/node/article`,
    {
      headers: {
        Accept: `application/vnd.api+json`,
        "Content-type": `application/vnd.api+json`,
        Authorization: `Basic YWRtaW46cGFzc3dvcmQ=`,
      },
      responseType: `json`,
      json: {
        data: {
          type: `node--article`,
          attributes: {
            title: `${newValue}`,
            body: {
              value: `Custom value`,
              format: `plain_text`,
            },
            field_chaos_id: id,
          },
        },
      },
    }
  )

  await got.post(`http://localhost:8000/__refresh`)

  //console.log(res.body)
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
  await got.delete(
    `https://dev-gatsby-drupal-stress-testing.pantheonsite.io/jsonapi/node/article/${node.context.drupalId}`,
    {
      headers: {
        Accept: `application/vnd.api+json`,
        "Content-type": `application/vnd.api+json`,
        Authorization: `Basic YWRtaW46cGFzc3dvcmQ=`,
      },
    }
  )

  await got.post(`http://localhost:8000/__refresh`)
}

const config = {
  rootUrl: `http://localhost:8000`,
  operators: {
    create: createOperator,
    delete: deleteOperator,
  },
  operationsLimit: 10,
  interval: 4,
}

run(config, (state) => {
  console.log(`event: `, state.event.type)
  if (state.changed) {
    console.log(
      state.value,
      state.context.operations.map((op) => {
        return { value: op.state.value, context: op.state.context }
      }),
      state.context.nodes
    )
  }
})
