
// pages/api/flixhq/sources.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { MOVIES } from 'flixhq-core';

const flixhq = new MOVIES.FlixHQ();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mediaId, episodeId } = req.query;

  if (!mediaId || !episodeId) {
    return res.status(400).json({ error: 'mediaId and episodeId are required.' });
  }

  try {
    const data = await flixhq.fetchEpisodeSources(String(mediaId), String(episodeId));
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error fetching FlixHQ sources:', error);
    res.status(500).json({ error: 'Failed to fetch FlixHQ sources.' });
  }
}
