module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[project]/src/lib/signature.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cross-platform SHA-256 hex hash for signing mock credentials.
 * Uses Web Crypto (`globalThis.crypto.subtle`) when available (browser and
 * Node.js WebCrypto), otherwise falls back to dynamic import of Node's
 * `crypto` module.
 */ __turbopack_context__.s([
    "signCredential",
    ()=>signCredential
]);
async function signCredential(data) {
    const payload = JSON.stringify(data);
    // Use Web Crypto API when available (browser or Node's globalThis.crypto)
    if (globalThis.crypto && globalThis.crypto.subtle) {
        const enc = new TextEncoder();
        const hashed = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(payload));
        const hashArray = Array.from(new Uint8Array(hashed));
        return hashArray.map((b)=>b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback: dynamic-import Node's crypto (keeps bundlers from including it)
    const { createHash } = await __turbopack_context__.A("[externals]/crypto [external] (crypto, cjs, async loader)");
    return createHash("sha256").update(payload).digest("hex");
}
}),
"[project]/src/lib/credentialService.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "issueCredential",
    ()=>issueCredential
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$signature$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/signature.ts [ssr] (ecmascript)");
;
async function issueCredential(age) {
    const credentialId = globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const issuedAt = Date.now();
    const signature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$signature$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["signCredential"])({
        credentialId,
        age,
        issuedAt
    });
    return {
        credentialId,
        issuer: "DemoGov",
        age,
        issuedAt,
        signature
    };
}
}),
"[project]/src/lib/wallet.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCredential",
    ()=>clearCredential,
    "loadCredential",
    ()=>loadCredential,
    "saveCredential",
    ()=>saveCredential
]);
const KEY = "vyntra_wallet";
function saveCredential(cred) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function loadCredential() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const data = undefined;
}
function clearCredential() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
}),
"[project]/src/pages/issuer.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IssuerPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/credentialService.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$wallet$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/wallet.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
;
;
;
;
;
function IssuerPage() {
    const [age, setAge] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(18);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [isIssuing, setIsIssuing] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const handleIssue = async ()=>{
        setIsIssuing(true);
        setStatus("");
        try {
            const credential = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialService$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["issueCredential"])(age);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$wallet$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["saveCredential"])(credential);
            setStatus("Credential issued and saved ✔");
        } catch (err) {
            console.error(err);
            setStatus("Failed to issue credential");
        } finally{
            setIsIssuing(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: "Issuer"
            }, void 0, false, {
                fileName: "[project]/src/pages/issuer.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                type: "number",
                value: age,
                onChange: (e)=>setAge(Number(e.target.value)),
                style: {
                    padding: 8
                }
            }, void 0, false, {
                fileName: "[project]/src/pages/issuer.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: handleIssue,
                style: {
                    marginLeft: 10
                },
                disabled: isIssuing,
                children: isIssuing ? "Issuing…" : "Issue Credential"
            }, void 0, false, {
                fileName: "[project]/src/pages/issuer.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: status
            }, void 0, false, {
                fileName: "[project]/src/pages/issuer.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    children: "Back"
                }, void 0, false, {
                    fileName: "[project]/src/pages/issuer.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/pages/issuer.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/pages/issuer.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__16_944r._.js.map