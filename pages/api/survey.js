import { get, set } from '@vercel/global-config';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const url = await get('survey_url') || 'https://forms.google.com';
      return res.status(200).json({ url });
    } catch {
      return res.status(200).json({ url: 'https://forms.google.com' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'URL requerida' });

      await set('survey_url', url);
      return res.status(200).json({ success: true, url });
    } catch (error) {
      return res.status(500).json({ error: 'Error al guardar' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}