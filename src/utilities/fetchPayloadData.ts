import { getServerSideURL } from './getURL'

type PayloadRequest = {
  query: string
  variables?: Record<string, unknown>
}

export async function fetchPayloadData({ query, variables }: PayloadRequest) {
  const baseUrl = getServerSideURL()
  const apiUrl = `${baseUrl}/api/graphql`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { tags: ['global'] }, // For Next.js cache tagging
    })

    if (!response.ok) {
      throw new Error(`Payload API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(
        `GraphQL Error: ${JSON.stringify(data.errors, null, 2)}`
      )
    }

    return data
  } catch (error) {
    console.error('Error fetching data from Payload:', error)
    return {
      data: {},
    }
  }
}