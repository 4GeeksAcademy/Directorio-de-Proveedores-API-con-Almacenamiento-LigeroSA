module.exports = [
"[project]/components/candidates/candidate-detail.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CandidateDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/candidates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/candidate.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const inProgressStages = [
    "review",
    "personal_interview",
    "technical_interview"
];
function safeLink(value) {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch  {
        return null;
    }
}
function CandidateDetail({ id }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        kind: "loading"
    });
    const [attempt, setAttempt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        async function load() {
            setState({
                kind: "loading"
            });
            try {
                const candidate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCandidate"])(id, controller.signal);
                if (!controller.signal.aborted) {
                    setState({
                        kind: "success",
                        candidate
                    });
                    setStatus(candidate.status);
                    setStage(candidate.stage);
                }
            } catch (error) {
                if (!controller.signal.aborted) setState({
                    kind: "error",
                    message: error instanceof Error ? error.message : "Error desconocido."
                });
            }
        }
        void load();
        return ()=>controller.abort();
    }, [
        id,
        attempt
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (message?.kind !== "success") return;
        const timer = window.setTimeout(()=>setMessage(null), 4000);
        return ()=>window.clearTimeout(timer);
    }, [
        message
    ]);
    function changeStatus(value) {
        setStatus(value);
        if (value === "received") setStage("pending");
        else if (value === "selected") setStage("offer_presented");
        else if (value === "in_progress") setStage("");
    }
    async function saveProgress(event) {
        event.preventDefault();
        if (state.kind !== "success" || saving) return;
        if (status === "in_progress" && !inProgressStages.includes(stage)) {
            setMessage({
                kind: "error",
                text: "Selecciona una etapa para la candidatura en proceso."
            });
            return;
        }
        const previous = state.candidate;
        const nextStage = status === "discarded" ? previous.stage : stage;
        setState({
            kind: "success",
            candidate: {
                ...previous,
                status,
                stage: nextStage
            }
        });
        setSaving(true);
        setMessage(null);
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateCandidateProgress"])(id, status === "discarded" ? {
                status
            } : {
                status,
                stage: nextStage
            });
            setState({
                kind: "success",
                candidate: updated
            });
            setStatus(updated.status);
            setStage(updated.stage);
            setMessage({
                kind: "success",
                text: "Candidatura actualizada correctamente."
            });
        } catch (error) {
            setState({
                kind: "success",
                candidate: previous
            });
            setStatus(previous.status);
            setStage(previous.stage);
            setMessage({
                kind: "error",
                text: `No se pudo actualizar la candidatura. ${error instanceof Error ? error.message : "Error desconocido."}`
            });
        } finally{
            setSaving(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-slate-200 pb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg font-semibold text-teal-700",
                        children: "HealthCore"
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "mt-3 inline-block text-sm font-medium text-teal-800 underline-offset-4 hover:underline",
                        children: "← Volver a candidaturas"
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/candidates/candidate-detail.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            state.kind === "loading" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "status",
                className: "space-y-3 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Cargando candidatura..."
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 99,
                        columnNumber: 82
                    }, this),
                    [
                        1,
                        2,
                        3
                    ].map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-16 animate-pulse rounded bg-slate-200"
                        }, row, false, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 99,
                            columnNumber: 136
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/candidates/candidate-detail.tsx",
                lineNumber: 99,
                columnNumber: 36
            }, this),
            state.kind === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: "mt-8 border-l-4 border-red-600 bg-red-50 p-4 text-red-900",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-semibold",
                        children: "No se pudo cargar la candidatura."
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 100,
                        columnNumber: 122
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm",
                        children: state.message
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 100,
                        columnNumber: 188
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setAttempt((value)=>value + 1),
                        className: "mt-3 rounded border border-red-700 px-3 py-1.5 text-sm font-semibold",
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 100,
                        columnNumber: 235
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/candidates/candidate-detail.tsx",
                lineNumber: 100,
                columnNumber: 34
            }, this),
            state.kind === "success" && (()=>{
                const candidate = state.candidate;
                const linkedin = safeLink(candidate.linkedin_url);
                const cv = safeLink(candidate.cv_url);
                const appliedDate = new Date(candidate.applied_at);
                const fields = [
                    [
                        "Correo electrónico",
                        candidate.email
                    ],
                    [
                        "Teléfono",
                        candidate.phone || "No indicado"
                    ],
                    [
                        "Puesto",
                        candidate.position
                    ],
                    [
                        "Experiencia",
                        `${candidate.experience_years} años`
                    ],
                    [
                        "Fecha de aplicación",
                        Number.isNaN(appliedDate.getTime()) ? candidate.applied_at : new Intl.DateTimeFormat("es", {
                            dateStyle: "medium"
                        }).format(appliedDate)
                    ]
                ];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold uppercase text-teal-700",
                            children: "People & Talent"
                        }, void 0, false, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "mt-1 break-words text-2xl font-semibold text-slate-900",
                            children: candidate.full_name
                        }, void 0, false, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-sm text-slate-600",
                            children: [
                                __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["statusLabels"][candidate.status] ?? candidate.status,
                                " · ",
                                candidate.status === "discarded" ? "Sin etapa" : __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stageLabels"][candidate.stage] ?? candidate.stage
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            "aria-labelledby": "details-title",
                            className: "mt-8 border-t border-slate-200 pt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: "details-title",
                                    className: "text-lg font-semibold",
                                    children: "Datos de la candidatura"
                                }, void 0, false, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                    className: "mt-4 grid gap-5 sm:grid-cols-2",
                                    children: [
                                        fields.map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-sm text-slate-500",
                                                        children: label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 84
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        className: "mt-1 break-words text-sm text-slate-900",
                                                        children: value
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 135
                                                    }, this)
                                                ]
                                            }, label, true, {
                                                fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                lineNumber: 120,
                                                columnNumber: 47
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                    className: "text-sm text-slate-500",
                                                    children: "LinkedIn"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                    className: "mt-1 break-all text-sm",
                                                    children: linkedin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: linkedin,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "text-teal-800 underline",
                                                        children: "Abrir perfil"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                        lineNumber: 121,
                                                        columnNumber: 123
                                                    }, this) : "No disponible"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 72
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 121,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                    className: "text-sm text-slate-500",
                                                    children: "Currículum"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 122,
                                                    columnNumber: 20
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                    className: "mt-1 break-all text-sm",
                                                    children: cv ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: cv,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "text-teal-800 underline",
                                                        children: "Abrir currículum"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 119
                                                    }, this) : "No disponible"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 122,
                                                    columnNumber: 74
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 122,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            "aria-labelledby": "progress-title",
                            className: "mt-8 border-t border-slate-200 pt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: "progress-title",
                                    className: "text-lg font-semibold",
                                    children: "Estado y etapa"
                                }, void 0, false, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    role: message.kind === "error" ? "alert" : "status",
                                    className: `mt-4 rounded p-3 text-sm ${message.kind === "error" ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"}`,
                                    children: message.text
                                }, void 0, false, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 127,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: saveProgress,
                                    className: "mt-4 flex flex-wrap items-end gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "grid min-w-48 gap-1 text-sm font-medium",
                                            children: [
                                                "Estado",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: status,
                                                    onChange: (event)=>changeStatus(event.target.value),
                                                    disabled: saving,
                                                    className: "rounded border border-slate-300 bg-white px-3 py-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            disabled: true,
                                                            children: "Selecciona un estado"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                            lineNumber: 129,
                                                            columnNumber: 239
                                                        }, this),
                                                        Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["statusLabels"]).map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: value,
                                                                children: label
                                                            }, value, false, {
                                                                fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                                lineNumber: 129,
                                                                columnNumber: 348
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 129,
                                                    columnNumber: 80
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this),
                                        status !== "discarded" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "grid min-w-48 gap-1 text-sm font-medium",
                                            children: [
                                                "Etapa",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: stage,
                                                    onChange: (event)=>setStage(event.target.value),
                                                    disabled: saving || status !== "in_progress",
                                                    required: true,
                                                    className: "rounded border border-slate-300 bg-white px-3 py-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            disabled: true,
                                                            children: "Selecciona una etapa"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                            lineNumber: 130,
                                                            columnNumber: 297
                                                        }, this),
                                                        (status === "in_progress" ? inProgressStages : status === "received" ? [
                                                            "pending"
                                                        ] : status === "selected" ? [
                                                            "offer_presented"
                                                        ] : []).map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: value,
                                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stageLabels"][value]
                                                            }, value, false, {
                                                                fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                                lineNumber: 130,
                                                                columnNumber: 503
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 106
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 130,
                                            columnNumber: 42
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: saving,
                                            className: "rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60",
                                            children: saving ? "Guardando..." : "Guardar cambios"
                                        }, void 0, false, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                    lineNumber: 113,
                    columnNumber: 16
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/components/candidates/candidate-detail.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
}),
"[project]/services/candidates.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCandidate",
    ()=>getCandidate,
    "getCandidates",
    ()=>getCandidates,
    "updateCandidateProgress",
    ()=>updateCandidateProgress
]);
const API_URL = ("TURBOPACK compile-time value", "https://playground.4geeks.com/tracker/api/v1");
function apiUrl(path) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return `${API_URL.replace(/\/$/, "")}${path}`;
}
async function getCandidates(signal) {
    const candidates = [];
    let page = 1;
    let total = 0;
    do {
        const response = await fetch(apiUrl(`/records?page=${page}&limit=100`), {
            signal
        });
        if (!response.ok) {
            throw new Error(`La API respondió con el código ${response.status}.`);
        }
        const result = await response.json();
        if (!Array.isArray(result.data) || !Number.isInteger(result.total) || result.total < 0) {
            throw new Error("La API devolvió una respuesta inesperada.");
        }
        if (result.data.length === 0 && candidates.length < result.total) {
            throw new Error("No se pudieron recuperar todas las candidaturas.");
        }
        candidates.push(...result.data);
        total = result.total;
        page += 1;
    }while (candidates.length < total)
    return candidates;
}
async function getCandidate(id, signal) {
    const response = await fetch(apiUrl(`/records/${encodeURIComponent(id)}`), {
        signal
    });
    if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
    return await response.json();
}
async function updateCandidateProgress(id, progress) {
    const response = await fetch(apiUrl(`/records/${encodeURIComponent(id)}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(progress)
    });
    if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
    return await response.json();
}
}),
"[project]/types/candidate.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stageLabels",
    ()=>stageLabels,
    "statusLabels",
    ()=>statusLabels
]);
const statusLabels = {
    received: "Recibida",
    in_progress: "En proceso",
    selected: "Seleccionada",
    discarded: "Descartada"
};
const stageLabels = {
    pending: "Pendiente",
    review: "Revisión",
    personal_interview: "Entrevista personal",
    technical_interview: "Entrevista técnica",
    offer_presented: "Oferta presentada"
};
}),
];

//# sourceMappingURL=_0hn7vilwozsfv._.js.map