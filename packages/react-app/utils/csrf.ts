import axios from 'axios';

export async function getCsrfToken(): Promise<string> {
    try {
        const response = await axios.get('/api/csrf-token');
        return response.data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        throw new Error('Failed to fetch CSRF token');
    }
}
