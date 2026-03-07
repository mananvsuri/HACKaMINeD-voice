import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

export const fetchInsights = async () => {
    const response = await api.get('/revenue/insights');
    return response.data;
};

export const fetchCombos = async () => {
    const response = await api.get('/revenue/combos');
    return response.data;
};

export const submitAudioOrder = async (audioBlob, currentCart = []) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'order.webm');
    formData.append('current_cart', JSON.stringify(currentCart));

    const response = await api.post('/voice/order', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const submitTextOrder = async (text, currentCart = []) => {
    const response = await api.post('/voice/text-order', { text, current_cart: JSON.stringify(currentCart) });
    return response.data;
};

export const confirmOrder = async (orderData) => {
    const response = await api.post('/voice/confirm', orderData);
    return response.data;
};

export const fetchOrders = async () => {
    const response = await api.get('/orders/');
    return response.data;
};

export const submitConversationTurn = async (audioBlob, chatHistory, currentCart = []) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'conversation.webm');
    formData.append('chat_history', JSON.stringify(chatHistory));
    formData.append('current_cart', JSON.stringify(currentCart));

    const response = await api.post('/voice/conversation', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const generateMarketingCampaign = async (itemName, discountPercentage) => {
    const response = await api.post('/marketing/generate', {
        item_name: itemName,
        discount_percentage: discountPercentage
    });
    return response.data;
};
