const API = '/api/graph';

export async function savePaper({ title, authors, abstract, source, url, keywords, userId }) {
  const res = await fetch(`${API}/papers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, authors, abstract, source, url, keywords, userId }),
  });
  return res.json();
}

export async function getRelatedPapers(title, limit = 10) {
  const res = await fetch(`${API}/papers/${encodeURIComponent(title)}/related?limit=${limit}`);
  return res.json();
}

export async function getUserPapers(userId) {
  const res = await fetch(`${API}/users/${userId}/papers`);
  return res.json();
}

export async function suggestDatasets(title) {
  const res = await fetch(`${API}/papers/${encodeURIComponent(title)}/suggest-datasets`);
  return res.json();
}

export async function saveDataset({ title, source, url, keywords, userId }) {
  const res = await fetch(`${API}/datasets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, source, url, keywords, userId }),
  });
  return res.json();
}

export async function getTrendingKeywords(limit = 20) {
  const res = await fetch(`${API}/trending-keywords?limit=${limit}`);
  return res.json();
}
