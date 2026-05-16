import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : '/api'

const client = axios.create({ baseURL: BASE, timeout: 60_000 })

export const getContactInfo = () => 
  client.get('/contact-info').then(r => r.data).catch(() => ({ email: 'info@magnevents.com', phone: '+91 0000000000' }))

export default client
