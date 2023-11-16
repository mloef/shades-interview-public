const { createClient } = require('@sanity/client');

const SANITY_TOKEN = "skhLt66xvL9Su33PHxTZhFogKkIfihoz0DqSHczuk6VthoillcAuSH7K2UNia8Tsu5oXhxbh2AfZMZWXPtWt3B0rBuQuCH5JpNQFSZgvOD1vQabaqbi3Gk9WRSlj96zU3umK7pYDJP2y4ThDj8hWNPdUU2pvtutx2yDEfw7rZzH1gdaoe2Aa"
const SANITY_ENV = "dev"
const SANITY = createClient({
  projectId: '0unlbb72',
  dataset: SANITY_ENV,
  apiVersion: '2022-03-29',
  token: SANITY_TOKEN,
  useCdn: true
})


async function fetchPosts() {
    const posts = await SANITY.fetch('*[_type == "tile"]{title, summary, sharingImage1x2Url}[0..5]');
    console.log(posts);
  }
  
  fetchPosts().catch(error => {
    console.error('Error fetching posts:', error);
  });