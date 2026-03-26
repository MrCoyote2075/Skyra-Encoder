export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { url } = req.body;

        if (!url) 
            return res.status(400).json({ error: "URL required" });

        let finalUrl = url.startsWith("http") ? url : "https://" + url;

        try {
            new URL(finalUrl);
        } catch {
            return res.status(400).json({ error: "Invalid URL format" });
        }

        async function fetchWithRetry(fetchUrl, retries = 2) {
            for (let i = 0; i <= retries; i++) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(fetchUrl, {
                        signal: controller.signal,
                    });

                    clearTimeout(timeout);

                    const text = await response.text();

                    if (text && text.startsWith("http")) {
                        return text;
                    } else {
                        throw new Error(text);
                    }

                } catch (err) {
                    if (i === retries) throw err;
                }
            }
        }

        let shortUrl;
        try {
            shortUrl = await fetchWithRetry(
                `https://is.gd/create.php?format=simple&url=${encodeURIComponent(finalUrl)}`
            );
        } catch (err) {
            console.error("Shortener failed:", err);
            return res.status(500).json({
                error: "URL shortening service unavailable. Try again.",
            });
        }

        const code = shortUrl.split("/").pop();

        const charset =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const shifts = [-1, 2, -4, 2, -2, 0, -2, 2, -7, 4];
        const n = charset.length;

        let result = "";

        for (let i = 0; i < code.length; i++) {
            let index = charset.indexOf(code[i]);

            if (index === -1) {
                throw new Error("Invalid character in code");
            }

            let shift = shifts[i % shifts.length];

            let newIndex = (index + shift) % n;
            if (newIndex < 0) newIndex += n;

            result += charset[newIndex];
        }

        return res.status(200).json({
            encoded: `IS-${result}`,
            shortUrl,
            status: "Generated using is.gd",
        });

    } catch (err) {
        console.error("ERROR:", err);
        return res.status(500).json({
            error: "Something went wrong. Please try again.",
        });
    }
}