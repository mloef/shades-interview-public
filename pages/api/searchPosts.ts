import { NextApiRequest, NextApiResponse } from 'next';
const { createClient } = require('@sanity/client');
import lunr from 'lunr';

const SANITY_TOKEN = 'nope';
const SANITY_ENV = "dev";
const SANITY = createClient({
  projectId: 'nuh uh',
  dataset: SANITY_ENV,
  apiVersion: '2022-03-29',
  token: SANITY_TOKEN,
  useCdn: false
});

let IDX: lunr.Index;

let POSTS: { [key: string]: ListItemProps } = {};

var indexReady = false;

(async function () {
  IDX = await getIndex();
})();

async function getIndex() {
  const posts: ListItemProps[] = await SANITY.fetch('*[_type == "tile" && !developing]{_id, title, summary, "imageUrl": image1x2.asset->url}');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    POSTS[post._id] = post;
  }

  const idx = lunr(function () {
    this.ref('_id');
    this.field('title', { boost: 10 });
    this.field('summary', { boost: 5 });

    posts.forEach((doc) => {
      this.add(doc);
    })
  })

  indexReady = true;

  return idx;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      //wait until index is ready
      while (!indexReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const query = req.body.query;

      const results = IDX.search("*" + query.replace(/\s/g, '') + "* " + query).slice(0, 10);

      return res.status(200).json(results.map(({ ref }) => POSTS[ref]));
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from Sanity.' });
  }
}