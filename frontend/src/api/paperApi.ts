import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export interface Paper {
  id: string
  title: string
  authors: string
  abstract?: string
  doi?: string
  arxiv_id?: string
  created_at: string
}

export interface TocItem {
  level: number
  title: string
  page: number
}

export interface Annotation {
  page: number
  x: number
  y: number
  width: number
  height: number
  text?: string
  color: string
  note?: string
}

export const paperApi = {
  listPapers: () => api.get<Paper[]>('/papers/').then(r => r.data),

  getPaper: (id: string) => api.get<Paper>(`/papers/${id}`).then(r => r.data),

  importPaper: (file?: File, url?: string, arxivId?: string, doi?: string) => {
    const formData = new FormData()
    if (file) formData.append('file', file)
    if (url) formData.append('url', url)
    if (arxivId) formData.append('arxiv_id', arxivId)
    if (doi) formData.append('doi', doi)
    return api.post<{ id: string }>('/papers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getToc: (id: string) => api.get<{ toc: TocItem[] }>(`/papers/${id}/toc`).then(r => r.data),

  queryAI: (id: string, question: string) =>
    api.post<{ answer: string }>(`/papers/${id}/ai/query`, { question }).then(r => r.data),

  translate: (id: string, text?: string, full?: boolean) =>
    api.post<{ translation: string }>(`/papers/${id}/translate`, { text, full }).then(r => r.data),

  getAnnotations: (id: string) =>
    api.get<{ annotations: Annotation[] }>(`/annotations/${id}`).then(r => r.data),

  saveAnnotations: (id: string, annotations: Annotation[]) =>
    api.post(`/annotations/${id}`, annotations).then(r => r.data),
}
