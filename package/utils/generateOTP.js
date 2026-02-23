export const generateSecureOTP = () => {
    const array = new Uint32Array(1);
    global.crypto.getRandomValues(array);

    return (array[0] % 900000 + 100000).toString();
};