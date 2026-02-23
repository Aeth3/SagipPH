import { Buffer } from "buffer"; // Import Buffer
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";

import { COLORS } from "package/src/legacyApp";
import Snackbar from "react-native-snackbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from 'react-native-fs'
import axios from "axios";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import CryptoJS from 'crypto-js';
import ImageResizer from 'react-native-image-resizer';
import { performOcr } from 'react-native-scanbot-sdk';

// Function to generate Basic Auth header
export const getAuthHeader = (username, password) => {
    const credentials = `${username}:${password}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");
    return `Basic ${encodedCredentials}`;
};

// export const handleLogout = (props) => {
//     const { logout } = useAuth()
//     Alert.alert("Logout", "Are you sure you want to log out?", [
//         {
//             text: "Cancel",
//             style: "cancel",
//         },
//         {
//             text: "Yes",
//             onPress: async () => {
//                 logout()
//                 // Optionally close the drawer after action
//                 props.navigation.closeDrawer();
//             },
//         },
//     ]);
// };

export const ShowSnackbarSuccess = (label) => {
    Snackbar.show({
        text: label,
        backgroundColor: COLORS.success,
        duration: Snackbar.LENGTH_SHORT,
    });
}

export const ShowSnackbarError = (label) => {
    Snackbar.show({
        text: label,
        backgroundColor: COLORS.danger,
        duration: Snackbar.LENGTH_SHORT,
    });
}

export function LoadingScreen() {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
    </View>
}

export const clearStorage = async () => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error("Error clearing local storage:", error);
    }
};

export const uploadAllAnswers = async () => {

}

export const saveJsonToFile = async (jsonData) => {
    const path = RNFS.DocumentDirectoryPath + '/unsync_households.json'; // File path
    try {
        await RNFS.writeFile(path, JSON.stringify(jsonData, null, 2), 'utf8');
        // console.log('File saved at:', path);
        return path
    } catch (error) {
        console.error('File save error:', error);
    }
};

/**
 * Uploads a file to the specified API endpoint.
 * @param {string} filePath - The full file path.
 * @param {string} apiUrl - The API endpoint URL.
 * @param {string} authToken - The Bearer token for authentication.
 * @returns {Promise<Object>} - The API response.
 */
export const uploadFile = async (filePath, apiUrl, authToken) => {
    try {
        // Create FormData
        let data = new FormData();
        data.append('data_upload', {
            uri: `file://${filePath}`,  // Ensure correct file URI format
            type: 'application/json',   // Change type if needed
            name: 'syncHouseholds.json'    // Ensure correct filename
        });
        console.log("data", data);

        // Axios request configuration
        let config = {
            method: 'post',
            url: apiUrl,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',  // Set Content-Type manually
            },
            data: data
        };

        // Make the API request
        const response = await axios.request(config);
        return response.data;  // Return response data
    } catch (error) {
        console.error("File Upload Error:", error);
        throw error;
    }
};

const requestStoragePermission = async ({ showAlert } = {}) => {
    const alertFn = showAlert || ((title, message) => {
        ShowSnackbarError([title, message].filter(Boolean).join(": "));
    });
    let permission;

    if (Platform.OS === 'android') {
        if (Platform.Version >= 30) {
            console.log(PERMISSIONS.ANDROID);

            permission = PERMISSIONS.ANDROID.MANAGE_EXTERNAL_STORAGE;
        } else {
            permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        }
    } else {
        return true; // iOS does not need storage permission
    }

    if (!permission) {
        console.error("Storage permission key is undefined");
        return false;
    }

    try {
        console.log("Checking permission:", permission);
        const result = await check(permission);
        console.log("Permission check result:", result);

        if (result === RESULTS.GRANTED) return true;

        if (result === RESULTS.BLOCKED) {
            alertFn(
                "Permission Denied",
                "Storage permission is blocked. Open settings to allow access.",
                [{ text: "Open Settings", onPress: openSettings }, { text: "Cancel", style: "cancel" }]
            );
            return false;
        }

        console.log("Requesting permission...");
        const requestResult = await request(permission);
        console.log("Permission request result:", requestResult);

        return requestResult === RESULTS.GRANTED;
    } catch (error) {
        console.error("Error checking/requesting permission:", error);
        return false;
    }
};

// Save JSON to Downloads
export const saveJsonToDownloads = async (jsonObject, { showAlert } = {}) => {
    const successFn = showAlert || ((title, message) => {
        ShowSnackbarSuccess([title, message].filter(Boolean).join(": "));
    });
    const errorFn = showAlert || ((title, message) => {
        ShowSnackbarError([title, message].filter(Boolean).join(": "));
    });
    const uniqueId = Date.now().toString();

    const jsonContent = JSON.stringify(jsonObject, null, 2);
    const path = `${RNFS.DownloadDirectoryPath}/sync_households_${uniqueId}.json`;

    try {
        await RNFS.writeFile(path, jsonContent, 'utf8');
        console.log('JSON file saved at:', path);
        successFn("Success", `File saved in Downloads!\nPath: ${path}`);
    } catch (error) {
        console.error('Error saving file:', error);
        errorFn("Error", "Failed to save file");
    }
};

export function VotersLoadingScreen({ message }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.title}>{message}</Text>
            <Text style={styles.subtitle}>
                This may take a few minutes. Please wait.
            </Text>
        </View>
    );
}

export function decryptAES(payload, keyString, { showAlert } = {}) {
    const alertFn = showAlert || ((title, message) => {
        ShowSnackbarError([title, message].filter(Boolean).join(": "));
    });
    try {
        // Restore base64 format from URL-safe
        let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const combined = CryptoJS.enc.Base64.parse(base64);

        // Extract IV (first 16 bytes = 4 words)
        const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);

        const ciphertext = CryptoJS.lib.WordArray.create(
            combined.words.slice(4),
            combined.sigBytes - 16
        );

        const key = CryptoJS.MD5(keyString);

        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
            iv: iv,
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding,
        });

        const utf8 = decrypted.toString(CryptoJS.enc.Utf8);

        // Optional: parse JSON if that’s what you encrypted
        const parsed = JSON.parse(utf8);
        console.log("✅ Decrypted JSON:", parsed);
        return parsed;
    } catch (e) {
        alertFn("QR is not applicable")
        return null;
    }
}

export const incrementUploadCount = async () => {
    try {
        const value = await AsyncStorage.getItem('uploadCount');
        const currentCount = value ? parseInt(value, 10) : 0;
        const newCount = currentCount + 1;
        await AsyncStorage.setItem('uploadCount', newCount.toString());
        console.log('Upload count updated:', newCount);
    } catch (error) {
        console.error('Failed to increment upload count:', error);
    }
};

export const getUploadCount = async () => {
    const count = await AsyncStorage.getItem('uploadCount');
    return count
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    title: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        paddingHorizontal: 30,
    },
});

export const validateFields = (fields, formData, setErrors) => {
    const newErrors = {};


    fields.forEach((field) => {
        const value = formData[field.key];
        if (field.key === 'email' && value) {
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(value)) {
                newErrors[field.key] = 'Please enter a valid email address';
            }
        }
        // 1. REQUIRED VALIDATION
        if (field.required) {
            const isEmpty =
                value === '' ||
                value === undefined ||
                value === null ||
                (Array.isArray(value) && value.length === 0);

            if (isEmpty) {
                newErrors[field.key] = `${field.label} is required`;
                return; // stop further checks for this field
            }
        }
        console.log("field", field);
        // 2. EMAIL VALIDATION

    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
};
/**
 * Saves a Base64 image string as a PNG file to the device storage.
 * @param {string} base64String - The Base64 string (can include or exclude the data:image/png;base64, prefix)
 * @param {string} ticket_no - Unique filename identifier
 * @returns {Promise<string|null>} Full file URI (e.g. file:///...) or null on failure
 */
export const saveBase64ToImage = async (base64String, ticket_no) => {
    if (!base64String || typeof base64String !== 'string') {
        console.error('Invalid base64 string');
        return null;
    }

    // Remove Base64 prefix if present
    const cleanedBase64 = base64String.replace(/^data:image\/\w+;base64,/, '');
    const filePath = `${RNFS.DocumentDirectoryPath}/${ticket_no}.png`;

    try {
        await RNFS.writeFile(filePath, cleanedBase64, 'base64');
        const fullPath = `file://${filePath}`;
        console.log('Image saved at:', fullPath);
        return fullPath;
    } catch (err) {
        console.error('Error saving image:', err.message);
        return null;
    }
};

export const getProvinceIdByName = (name, dropdownData) => {
    console.log("name", name);

    const province = (dropdownData?.province || []).find(p => p.name === name);
    return province?.primary_id || null;
};

export const saveBase64AsJpg = async (base64String, filename = 'signature.jpg') => {
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;

    try {
        await RNFS.writeFile(path, base64String, 'base64');
        console.log('Image saved at:', path);
        return path;
    } catch (err) {
        console.error('Error saving image:', err);
        return null;
    }
};

export const saveToDownloads = async (base64String, filename = 'signature.jpg') => {
    try {
        // Request permission on Android
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission Required',
                    message: 'This app needs access to your storage to save files.',
                    buttonPositive: 'OK',
                }
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn('Storage permission denied');
                return;
            }
        }

        // Path to Downloads folder
        const path = `${RNFS.DownloadDirectoryPath}/${filename}`;

        // Write file
        await RNFS.writeFile(path, base64String, 'base64');
        console.log('File saved to:', path);
        return path;
    } catch (err) {
        console.error('Failed to save file:', err);
        return null;
    }
};

export const saveBase64Image = async (base64, filename = 'signature.jpg') => {
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, base64, 'base64');
    return path;
};

// Assuming formData.e_signature is base64 without prefix
export const convertBase64ToJpeg = async (base64Signature = '') => {
    try {
        // Step 1: Write PNG base64 to a temporary file
        const pngPath = `${RNFS.CachesDirectoryPath}/temp_signature.png`;
        await RNFS.writeFile(pngPath, base64Signature, 'base64');

        // Step 2: Resize/convert it to JPEG format using ImageResizer
        const response = await ImageResizer.createResizedImage(
            pngPath,
            300,       // width
            300,       // height
            'JPEG',    // format
            100        // quality
        );

        // Step 3: JPEG file is saved at response.uri
        return response.uri;
    } catch (error) {
        console.error('Error converting to JPEG:', error);
        return null;
    }
};

export const uploadToImgur = async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
    });

    try {
        const res = await axios.post('https://api.imgur.com/3/image', formData, {
            headers: {
                Authorization: 'Client-ID YOUR_CLIENT_ID', // Get from https://api.imgur.com/oauth2/addclient
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Imgur URL:', res.data.data.link);
        return res.data.data.link;
    } catch (err) {
        console.error('Imgur upload error:', err.response?.data || err.message);
    }
};

export const uploadToImgbb = async (base64Image) => {
    const apiKey = 'f580494110db57ebde32be15c12494b4';

    try {
        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            {
                image: base64Image,
            }
        );
        console.log('Imgbb URL:', response.data.data.url);
        return response.data.data.url;
    } catch (error) {
        console.error('Imgbb upload failed', error.response?.data || error.message);
    }
};

export async function extractTextFromDocument(image) {
    try {
        const result = await performOcr({
            imageFileUri: image.imageFileUri, // this comes from documentResult.data.pages[0]
            languages: ['en'], // Optional: add more if needed, e.g., ['en', 'de']
        });

        if (result.status === 'OK') {
            console.log("Extracted OCR text:", result.plainText);
        } else {
            console.warn("OCR failed:", result);
        }
    } catch (e) {
        console.error("OCR error:", e);
    }
}
export function extractPhilippineLicenseNumber(ocrLines) {
    // Merge into one line to simplify broken OCR artifacts
    const mergedText = ocrLines.join(' ').replace(/\s+/g, ' ').toUpperCase();

    // Attempt to fix space-inserted license numbers like "K21-2 1-201052"
    const corruptedPattern = /\b([A-Z0-9]{2,4})-?(\d{1})\s?(\d{1})-?(\d{6,})\b/;

    const match = mergedText.match(corruptedPattern);
    if (match) {
        // Reconstruct from split pattern
        const agency = match[1];
        const year = match[2] + match[3];
        const serial = match[4];
        return `${agency}-${year}-${serial}`;
    }

    return "Not found";
}
export const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const decodeSafeToken = (safeToken) => {
    try {
        // Step 1: decode URI component
        const finalToken = decodeURIComponent(safeToken);

        // Step 2: base64 decode
        const json2 = Buffer.from(finalToken, 'base64').toString('utf8');

        // Step 3: parse JSON
        const dataWithSignature = JSON.parse(json2);

        console.log("Decoded Data with Signature:", dataWithSignature);

        // Step 4: extract signature
        const signature = dataWithSignature.signature;
        console.log("Signature:", signature);

        // Step 5: remove signature to get original payment data
        const { signature: _, ...originalPaymentData } = dataWithSignature;

        // Step 6: decode signature back to JSON
        const decodedSignature = JSON.parse(Buffer.from(signature, 'base64').toString('utf8'));
        console.log("Decoded Signature JSON:", decodedSignature);

        return { dataWithSignature, originalPaymentData, decodedSignature };
    } catch (err) {
        console.error("Failed to decode safeToken:", err);
        return null;
    }
}

export const toBase64 = (str) => {
    return Buffer.from(str, "utf8").toString("base64");
};

export const generateDateTimeId = (prefix = "user") => {
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, ""); // YYYYMMDDHHmmssSSS
    const rand = Math.random().toString(36).slice(2, 8); // 6 chars
    return `${prefix}_${ts}_${rand}`;
};

const FIELD_MAP = {
    sender: "sender",
    location: "location",
    barangay: "location",
    street: "street",
    situation: "situation",
    name: "name",
    emergency_type: "emergencyType",
    risk_level: "riskLevel",
    geo_tag: "geoTag",
    other_contanct_no: "otherContactNo",
    other_contact_no: "otherContactNo",

    pregnant: "pregnant",
    senior: "senior",
    two_years_old_below: "twoYearsOldBelow",
    kids: "kids",
    pwd: "pwd",
    adult: "adult",
    animals: "animals",
    total: "total",
};

function parseNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function parseGeoTag(value) {
    if (!value) return null;

    const parts = value.split(",").map((v) => Number(v.trim()));
    if (parts.length !== 2 || parts.some(Number.isNaN)) return null;

    return { lat: parts[0], lng: parts[1] };
}

function normalizeDispatchKey(key) {
    return key
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

const NUMERIC_FIELDS = new Set([
    "pregnant",
    "senior",
    "twoYearsOldBelow",
    "kids",
    "pwd",
    "adult",
    "animals",
    "total",
]);

export function parseDispatchFromReply(reply, chatId) {
    if (!reply?.toUpperCase().includes("CONFIRMED_DISPATCH")) {
        return null;
    }

    const markerMatch = reply.match(/CONFIRMED_DISPATCH\s*:?\s*([\s\S]*)$/i);
    const block = markerMatch?.[1];
    if (!block) return null;

    const content = {
        sender: null,
        location: null,
        street: null,
        situation: null,
        name: null,
        emergencyType: null,
        riskLevel: null,
        geoTag: null,
        otherContactNo: null,

        // numeric fields default to 0
        pregnant: 0,
        senior: 0,
        twoYearsOldBelow: 0,
        kids: 0,
        pwd: 0,
        adult: 0,
        animals: 0,
        total: 0,
    };

    const lines = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    let parsedFieldCount = 0;

    for (const line of lines) {
        const match = line.match(/^(?:[-*]\s*)?(?:->|=>|[>\u2192\u27a4])?\s*([^|:]+?)\s*[|:]\s*(.+)$/);
        if (!match) continue;

        const rawKey = normalizeDispatchKey(match[1]);
        const value = match[2].trim();

        const mappedKey = FIELD_MAP[rawKey];
        if (!mappedKey) continue;

        // --- GEO TAG ---
        if (mappedKey === "geoTag") {
            content.geoTag = parseGeoTag(value);
            parsedFieldCount += 1;
            continue;
        }

        // --- NUMERIC FIELDS ---
        if (NUMERIC_FIELDS.has(mappedKey)) {
            content[mappedKey] = parseNumber(value);
            parsedFieldCount += 1;
            continue;
        }

        // --- NORMAL FIELDS ---
        content[mappedKey] = value;
        parsedFieldCount += 1;
    }

    if (parsedFieldCount === 0) return null;

    return {
        id: `dispatch_${Date.now()}`,
        chatId,
        type: "dispatch",
        content,
    };
}

function stringifyDispatchValue(value, fallback = "N/A") {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
}

function stringifyDispatchNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? String(n) : "0";
}

const PLACEHOLDER_VALUE_RE =
    /^(?:n\/a|na|none|null|unknown|not\s*provided|unspecified|wala|hindi\s*alam|di\s*alam|-|_)$/i;

function normalizeDispatchText(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (!text) return null;
    if (PLACEHOLDER_VALUE_RE.test(text)) return null;
    return text;
}

function normalizePhoneNumber(value) {
    const text = normalizeDispatchText(value);
    if (!text) return null;

    const digits = text.replace(/\D/g, "");
    if (/^09\d{9}$/.test(digits)) return digits;
    if (/^639\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
    return null;
}

function isValidLocationValue(value) {
    const text = normalizeDispatchText(value);
    if (!text) return false;
    return text.length >= 3;
}

function normalizeDispatchContent(content = {}) {
    const safeContent =
        content && typeof content === "object" ? content : {};

    return {
        sender: normalizePhoneNumber(safeContent.sender),
        location: normalizeDispatchText(safeContent.location),
        street: normalizeDispatchText(safeContent.street),
        situation: normalizeDispatchText(safeContent.situation),
        name: normalizeDispatchText(safeContent.name),
        emergencyType: normalizeDispatchText(safeContent.emergencyType),
        riskLevel: normalizeDispatchText(safeContent.riskLevel),
        geoTag: safeContent.geoTag ?? null,
        otherContactNo: normalizePhoneNumber(safeContent.otherContactNo),
        pregnant: parseNumber(safeContent.pregnant),
        senior: parseNumber(safeContent.senior),
        twoYearsOldBelow: parseNumber(safeContent.twoYearsOldBelow),
        kids: parseNumber(safeContent.kids),
        pwd: parseNumber(safeContent.pwd),
        adult: parseNumber(safeContent.adult),
        animals: parseNumber(safeContent.animals),
        total: parseNumber(safeContent.total),
    };
}

export function validateDispatchContent(content = {}) {
    const normalized = normalizeDispatchContent(content);
    const missing = [];

    if (!normalized.sender) missing.push("sender");
    if (!isValidLocationValue(normalized.location)) missing.push("location");
    if (!isValidLocationValue(normalized.street)) missing.push("street");
    if (!normalizeDispatchText(normalized.situation)) missing.push("situation");

    return {
        ready: missing.length === 0,
        missing,
        content: normalized,
    };
}

export function buildConfirmedDispatchBlock(content = {}) {
    const normalized = normalizeDispatchContent(content);
    const pregnant = parseNumber(normalized.pregnant);
    const senior = parseNumber(normalized.senior);
    const twoYearsOldBelow = parseNumber(normalized.twoYearsOldBelow);
    const kids = parseNumber(normalized.kids);
    const pwd = parseNumber(normalized.pwd);
    const adult = parseNumber(normalized.adult);
    const animals = parseNumber(normalized.animals);

    const totalFromCounts =
        pregnant + senior + twoYearsOldBelow + kids + pwd + adult;
    const total = Number.isFinite(Number(normalized.total))
        ? parseNumber(normalized.total)
        : totalFromCounts;

    const lines = [
        "CONFIRMED_DISPATCH:",
        `-> SENDER| ${stringifyDispatchValue(normalized.sender)}`,
        `-> BARANGAY| ${stringifyDispatchValue(normalized.location)}`,
        `-> STREET| ${stringifyDispatchValue(normalized.street)}`,
        `-> SITUATION| ${stringifyDispatchValue(normalized.situation)}`,
        `-> NAME| ${stringifyDispatchValue(normalized.name)}`,
        `-> EMERGENCY_TYPE| ${stringifyDispatchValue(normalized.emergencyType)}`,
        `-> RISK_LEVEL| ${stringifyDispatchValue(normalized.riskLevel)}`,
        `-> OTHER_CONTACT_NO| ${stringifyDispatchValue(normalized.otherContactNo)}`,
        `-> PREGNANT| ${stringifyDispatchNumber(pregnant)}`,
        `-> SENIOR| ${stringifyDispatchNumber(senior)}`,
        `-> TWO_YEARS_OLD_BELOW| ${stringifyDispatchNumber(twoYearsOldBelow)}`,
        `-> KIDS| ${stringifyDispatchNumber(kids)}`,
        `-> PWD| ${stringifyDispatchNumber(pwd)}`,
        `-> ADULT| ${stringifyDispatchNumber(adult)}`,
        `-> ANIMALS| ${stringifyDispatchNumber(animals)}`,
        `-> Total| ${stringifyDispatchNumber(total)}`,
    ];

    return lines.join("\n");
}
