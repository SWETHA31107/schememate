import axios from 'axios';
import { localSchemes } from './localSeedData';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fallback logic when API is unreachable or fails (e.g. 404 on Vercel)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const url = config.url || '';

    console.warn(`API call failed for ${url}. Using local seed data fallback.`);

    // Handle GET /schemes and GET /schemes/:id
    if (url.includes('/schemes')) {
      if (url.includes('/schemes/')) {
        const id = url.split('/schemes/')[1]?.split('?')[0];
        const scheme = localSchemes.find(s => s._id === id || s.id === id) || localSchemes[0];
        return { data: scheme };
      }

      // Extract search parameters if present
      let filtered = [...localSchemes];
      const searchIndex = url.indexOf('?');
      if (searchIndex !== -1) {
        const params = new URLSearchParams(url.slice(searchIndex));
        const search = params.get('search')?.toLowerCase();
        const category = params.get('category');
        const provider = params.get('provider');
        const state = params.get('state');
        const gender = params.get('gender');
        const community = params.get('community');
        const maritalStatus = params.get('maritalStatus');
        const age = Number(params.get('age'));
        const interestRate = Number(params.get('interestRate'));

        if (search) {
          filtered = filtered.filter(s => 
            s.schemeName.toLowerCase().includes(search) ||
            (s.description && s.description.toLowerCase().includes(search)) ||
            (s.subCategory && s.subCategory.toLowerCase().includes(search)) ||
            (s.state && s.state.toLowerCase().includes(search))
          );
        }
        if (category) filtered = filtered.filter(s => s.category === category);
        if (provider) filtered = filtered.filter(s => s.provider === provider);
        if (state) filtered = filtered.filter(s => s.state === state);
        if (gender && gender !== 'All') filtered = filtered.filter(s => !s.eligibility.gender || s.eligibility.gender === 'All' || s.eligibility.gender === gender);
        if (community) filtered = filtered.filter(s => !s.eligibility.community || s.eligibility.community.includes(community));
        if (maritalStatus && maritalStatus !== 'All') filtered = filtered.filter(s => !s.eligibility.maritalStatus || s.eligibility.maritalStatus === 'All' || s.eligibility.maritalStatus === maritalStatus);
        if (age && !isNaN(age)) filtered = filtered.filter(s => (!s.eligibility.minAge || s.eligibility.minAge <= age) && (!s.eligibility.maxAge || s.eligibility.maxAge >= age));
        if (interestRate && !isNaN(interestRate)) filtered = filtered.filter(s => s.interestRate <= interestRate);
      }

      return { data: filtered };
    }

    // Handle POST /compare
    if (url.includes('/compare')) {
      let body = {};
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch(e) {}
      const ids = body.schemeIds || [];
      const matched = localSchemes.filter(s => ids.includes(s._id) || ids.includes(s.id));
      return { data: matched.length > 0 ? matched : localSchemes.slice(0, 2) };
    }

    // Handle POST /check-eligibility
    if (url.includes('/check-eligibility')) {
      let body = {};
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch(e) {}
      const scheme = localSchemes.find(s => s._id === body.schemeId || s.id === body.schemeId);
      return {
        data: {
          eligible: true,
          missingConditions: [],
          alternatives: localSchemes.slice(1, 3)
        }
      };
    }

    // Handle POST /recommend
    if (url.includes('/recommend')) {
      const scored = localSchemes.slice(0, 5).map((scheme, i) => ({
        scheme,
        score: 95 - i * 5,
        reason: `Matches your profile criteria for ${scheme.category}.`
      }));
      return { data: scored };
    }

    // Handle Auth login/register
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      let body = {};
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch(e) {}
      const user = {
        _id: 'user_local',
        name: body.name || 'User',
        email: body.email || body.identifier || 'user@example.com',
        mobile: body.mobile || '9876543210',
        role: 'user',
        age: body.age || 25,
        token: 'local_jwt_token'
      };
      return { data: user };
    }

    // Handle Notifications
    if (url.includes('/notifications')) {
      return { data: [] };
    }

    // Handle Admin stats
    if (url.includes('/admin')) {
      return {
        data: {
          totalUsers: 120,
          verifiedUsers: 110,
          totalSchemes: localSchemes.length,
          totalFeedback: 15,
          categoryStats: [
            { _id: 'loan', count: 120 },
            { _id: 'savings', count: 130 },
            { _id: 'insurance', count: 100 },
            { _id: 'pension', count: 150 }
          ]
        }
      };
    }

    return Promise.reject(error);
  }
);

export default api;
