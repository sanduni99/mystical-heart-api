export const authAPI = {
  login: async (creds) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    return response.json();
  },
  register: async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const text = await response.text();
      
      if (!response.ok) {
        return { success: false, error: text };
      }

      const result = JSON.parse(text);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      return { success: true, data: result };
    } catch (err) {
      console.error('Network or parsing error:', err);
      return { success: false, error: err.message };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const profileAPI = {
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  updateProfile: async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  changePassword: async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/change-password', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  deleteAccount: async (password) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/account', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    return response.json();
  }
};

export const sessionAPI = {
  saveSession: async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};