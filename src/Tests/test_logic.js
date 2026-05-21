
const reverseStr = (s) => s.split('').reverse().join('');

const swapParts = (s) => {
    const m = s.length;
    if (m % 2 === 0) {
        const half = m / 2;
        const left = s.slice(0, half);
        const right = s.slice(half);
        return right + left;
    } else {
        const leftLen = Math.floor(m / 2);
        const left = s.slice(0, leftLen);
        const middle = s.charAt(leftLen);
        const right = s.slice(leftLen + 1);
        return right + middle + left;
    }
};

const unswapParts = (s) => {
    const m = s.length;
    if (m % 2 === 0) {
        const half = m / 2;
        const right = s.slice(0, half);
        const left = s.slice(half);
        return left + right;
    } else {
        const leftLen = Math.floor(m / 2);
        const rightLen = leftLen;
        const right = s.slice(0, rightLen);
        const middle = s.charAt(rightLen);
        const left = s.slice(rightLen + 1);
        return left + middle + right;
    }
};

const shiftChar = (ch, delta) => {
    const code = ch.charCodeAt(0);
    if (ch >= 'a' && ch <= 'z') {
        const base = 'a'.charCodeAt(0);
        const len = 26;
        return String.fromCharCode(((code - base + delta + len) % len) + base);
    }
    if (ch >= 'A' && ch <= 'Z') {
        const base = 'A'.charCodeAt(0);
        const len = 26;
        return String.fromCharCode(((code - base + delta + len) % len) + base);
    }
    if (ch >= '0' && ch <= '9') {
        const base = '0'.charCodeAt(0);
        const len = 10;
        return String.fromCharCode(((code - base + delta + len) % len) + base);
    }
    return String.fromCharCode(code + delta);
};

const altShift = (s, startDelta = 2) => {
    let delta = startDelta;
    return s.split('').map((ch) => {
        const out = shiftChar(ch, delta);
        delta = -delta; 
        return out;
    }).join('');
};

const encodeSkyra = (token, provId) => {
    let n = token.length;
    let temp = "";
    for (let i = 0; i < token.length; i++) {
        if (token[i] >= 'a' && token[i] <= 'z') temp += token[i].toUpperCase();
        else if (token[i] >= 'A' && token[i] <= 'Z') temp += token[i].toLowerCase();
        else temp += token[i];
    }
    token = temp;

    const first = token.charAt(0) || '';
    const last = token.charAt(n - 1) || '';
    const middle = n > 2 ? token.slice(1, n - 1) : '';
    const step2 = last + first + middle;
    const step3 = swapParts(step2);
    const step4 = altShift(step3, 2);
    const step5 = reverseStr(step4);
    return `${provId}${step5}`;
};

const decodeSkyra = (code) => {
    let core = code.slice(1);
    core = reverseStr(core);
    core = altShift(core, -2);
    core = unswapParts(core);
    
    const n = core.length;
    const last = core.charAt(0) || '';
    const first = core.charAt(1) || '';
    const middle = n > 2 ? core.slice(2) : '';
    let originalToken = first + middle + last;

    // Apply the case swap at the end to get back the original case
    let finalToken = "";
    for (let i = 0; i < originalToken.length; i++) {
        if (originalToken[i] >= 'a' && originalToken[i] <= 'z') finalToken += originalToken[i].toUpperCase();
        else if (originalToken[i] >= 'A' && originalToken[i] <= 'Z') finalToken += originalToken[i].toLowerCase();
        else finalToken += originalToken[i];
    }
    return finalToken;
};

const testToken = "ho8zF";
const provId = "1";
try {
    const encoded = encodeSkyra(testToken, provId);
    console.log("Original:", testToken);
    console.log("Encoded:", encoded);
    const decoded = decodeSkyra(encoded);
    console.log("Decoded:", decoded);
    if (decoded === testToken) {
        console.log("SUCCESS: Logic matches.");
    } else {
        console.log("FAILURE: Decoded does not match original.");
    }
} catch (e) {
    console.log("ERROR during test:", e.message);
}
