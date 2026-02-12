const PH_PHONE_REGEX = /^\+63\d{10}$/;

export const createPhone = (value) => {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) throw new Error('Phone number is required');
    if (!PH_PHONE_REGEX.test(normalized)) throw new Error('Invalid PH phone number. Use +63XXXXXXXXXX');
    return normalized;
};

