const VALID_PREFIXES = new Set([
    '905', '906', '907', '908', '909',
    '910', '912', '915', '916', '917', '918', '919',
    '920', '921', '922', '923', '924', '925', '926', '927', '928', '929',
    '930', '931', '932', '933', '934', '935', '936', '937', '938', '939',
    '940', '941', '942', '943', '945', '946', '947', '948', '949',
    '950', '951', '953', '954', '955', '956',
    '961', '965', '966', '967',
    '973', '974', '975', '976', '977', '978', '979',
    '991', '992', '993', '994', '995', '996', '997', '998', '999',
    '895', '896', '897', '898',
    '817'
]);

export const normalizePhoneNumber = (input) => {
    if (!input) return null;

    // Remove non-digits
    let digits = input.replace(/\D/g, '');

    // Basic length guard
    if (digits.length < 10 || digits.length > 12) return null;

    // Normalize to 639XXXXXXXXX
    if (digits.startsWith('0') && digits.length === 11) {
        digits = '63' + digits.slice(1);
    }
    else if (digits.startsWith('9') && digits.length === 10) {
        digits = '63' + digits;
    }

    // Must be exactly 12 digits starting with 63
    if (!/^63\d{10}$/.test(digits)) return null;

    // Extract mobile prefix (3 digits after 63)
    const prefix = digits.slice(2, 5); // 63917xxxxxxx -> 917

    if (!VALID_PREFIXES.has(prefix)) {
        return null;
    }

    return digits;
};

export const createPhone = (value) => {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) throw new Error("Phone number is required");

    // Strict canonical format for auth use-cases.
    if (!/^\+63\d{10}$/.test(raw)) {
        throw new Error("Invalid PH phone number. Use +63XXXXXXXXXX");
    }

    const digits = raw.slice(1); // strip leading "+"
    const prefix = digits.slice(2, 5);
    if (!VALID_PREFIXES.has(prefix)) {
        throw new Error("Invalid PH phone number. Use +63XXXXXXXXXX");
    }

    return raw;
};
