const PROVIDERS = [
    {
        id: "1",
        name: "shorturl",
        hosts: ["shorturl.at", "www.shorturl.at"],
    },
    {
        id: "2",
        name: "tinyurl",
        hosts: ["tinyurl.com", "www.tinyurl.com"],
    },
    {
        id: "3",
        name: "bitly",
        hosts: ["bit.ly", "www.bit.ly", "bitly.com", "www.bitly.com"],
    },
];

const PROVIDER_BY_HOST = new Map(
    PROVIDERS.flatMap((provider) => provider.hosts.map((host) => [host, provider]))
);
const PROVIDER_BY_ID = new Map(PROVIDERS.map((provider) => [provider.id, provider]));

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SHIFTS = [-1, 2, -4, 2, -2, 0, -2, 2, -7, 4];
const CHARSET_LENGTH = CHARSET.length;

function shiftToken(token, mode) {
    let result = "";

    for (let i = 0; i < token.length; i++) {
        const currentChar = token[i];
        const currentIndex = CHARSET.indexOf(currentChar);

        if (currentIndex === -1) {
            throw new Error("Unsupported character in short token.");
        }

        const shift = SHIFTS[i % SHIFTS.length];
        const appliedShift = mode === "encode" ? shift : -shift;
        let shiftedIndex = (currentIndex + appliedShift) % CHARSET_LENGTH;

        if (shiftedIndex < 0) {
            shiftedIndex += CHARSET_LENGTH;
        }

        result += CHARSET[shiftedIndex];
    }

    return result;
}

function parseShortUrl(inputUrl) {
    const normalizedInput = typeof inputUrl === "string" ? inputUrl.trim() : "";

    if (!normalizedInput) {
        throw new Error("URL required");
    }

    const withProtocol = /^https?:\/\//i.test(normalizedInput)
        ? normalizedInput
        : `https://${normalizedInput}`;

    let parsedUrl;
    try {
        parsedUrl = new URL(withProtocol);
    } catch {
        throw new Error("Invalid URL format");
    }

    const provider = PROVIDER_BY_HOST.get(parsedUrl.hostname.toLowerCase());
    if (!provider) {
        throw new Error("Only shorturl.at, tinyurl.com, and bitly URLs are supported.");
    }

    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    const token = segments.length ? decodeURIComponent(segments[segments.length - 1]) : "";

    if (!token) {
        throw new Error("Could not find the short token in this URL.");
    }

    return {
        provider,
        originalUrl: parsedUrl.href,
        token,
    };
}

function encodeWithProvider(provider, token) {
    const encodedToken = shiftToken(token, "encode");
    return `${provider.id}${encodedToken}`;
}

function decodeWithProvider(encodedCode) {
    const providerId = encodedCode[0];
    const provider = PROVIDER_BY_ID.get(providerId);

    if (!provider) {
        throw new Error("Invalid provider prefix in encoded value.");
    }

    const encodedToken = encodedCode.slice(1);
    if (!encodedToken) {
        throw new Error("Encoded value is missing token data.");
    }

    const decodedToken = shiftToken(encodedToken, "decode");
    return { provider, decodedToken };
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { url } = req.body ?? {};
        const { provider, originalUrl, token } = parseShortUrl(url);
        const encoded = encodeWithProvider(provider, token);
        const { decodedToken } = decodeWithProvider(encoded);

        return res.status(200).json({
<<<<<<< HEAD
            encoded: `DP-${result}`,
            shortUrl,
            status: "Generated using is.gd",
=======
            originalUrl,
            provider: provider.name,
            providerId: provider.id,
            shortCode: token,
            encoded,
            decoded: decodedToken,
            status: `Encoded using ${provider.name}`,
>>>>>>> 1567155dea34fca419171847d3b844421d20f906
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
        const clientErrors = new Set([
            "URL required",
            "Invalid URL format",
            "Only shorturl.at, tinyurl.com, and bitly URLs are supported.",
            "Could not find the short token in this URL.",
            "Unsupported character in short token.",
            "Invalid provider prefix in encoded value.",
            "Encoded value is missing token data.",
        ]);

        if (clientErrors.has(message)) {
            return res.status(400).json({ error: message });
        }

        console.error("encode-handler-error:", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
}
