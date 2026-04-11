import api from '../lib/api';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  is_active: boolean;
  created_at?: string;
}

export const bannerService = {
  getBanners: async () => {
    const response = await api.get('/banners');
    return response.data;
  },
  
  createBanner: async (data: Partial<Banner>) => {
    const response = await api.post('/banners', data);
    return response.data;
  },
  
  updateBanner: async (id: number, data: Partial<Banner>) => {
    const response = await api.put(`/banners/${id}`, data);
    return response.data;
  },
  
  deleteBanner: async (id: number) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  }
};
