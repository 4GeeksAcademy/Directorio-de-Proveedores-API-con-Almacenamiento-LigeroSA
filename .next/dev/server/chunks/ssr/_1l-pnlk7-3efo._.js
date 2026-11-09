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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notes$2f$notes$2d$section$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notes/notes-section.tsx [app-ssr] (ecmascript)");
"use client";
;
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const url = new URL(window.location.href);
        const result = url.searchParams.get("result");
        if (result === "created" || result === "updated") {
            setMessage({
                kind: "success",
                text: result === "created" ? "Candidatura creada correctamente." : "Candidatura actualizada correctamente."
            });
            url.searchParams.delete("result");
            window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
        }
    }, []);
    function changeStatus(value) {
        setStatus(value);
        if (value === "received") setStage("pending");
        else if (value === "selected") setStage("offer_presented");
        else if (value === "in_progress") setStage("");
    }
    async function saveProgress(event) {
        event.preventDefault();
        if (state.kind !== "success" || saving) return;
        if (!status || status === "in_progress" && (!stage || !inProgressStages.includes(stage))) {
            setMessage({
                kind: "error",
                text: "Selecciona una etapa para la candidatura en proceso."
            });
            return;
        }
        const previous = state.candidate;
        const nextStage = status === "discarded" ? previous.stage : stage;
        if (!nextStage) {
            setMessage({
                kind: "error",
                text: "Selecciona una etapa para la candidatura."
            });
            return;
        }
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
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "mt-3 inline-block text-sm font-medium text-teal-800 underline-offset-4 hover:underline",
                        children: "← Volver a candidaturas"
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/candidates/candidate-detail.tsx",
                lineNumber: 110,
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
                        lineNumber: 114,
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
                            lineNumber: 114,
                            columnNumber: 136
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/candidates/candidate-detail.tsx",
                lineNumber: 114,
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
                        lineNumber: 115,
                        columnNumber: 122
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm",
                        children: state.message
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 115,
                        columnNumber: 188
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setAttempt((value)=>value + 1),
                        className: "mt-3 rounded border border-red-700 px-3 py-1.5 text-sm font-semibold",
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                        lineNumber: 115,
                        columnNumber: 235
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/candidates/candidate-detail.tsx",
                lineNumber: 115,
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
                            lineNumber: 129,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "mt-1 break-words text-2xl font-semibold text-slate-900",
                            children: candidate.full_name
                        }, void 0, false, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 130,
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
                            lineNumber: 131,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: `/candidates/${encodeURIComponent(id)}/edit`,
                            className: "mt-4 inline-block rounded border border-teal-800 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50",
                            children: "Editar candidatura"
                        }, void 0, false, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 132,
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
                                    lineNumber: 134,
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
                                                        lineNumber: 136,
                                                        columnNumber: 84
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        className: "mt-1 break-words text-sm text-slate-900",
                                                        children: value
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                        lineNumber: 136,
                                                        columnNumber: 135
                                                    }, this)
                                                ]
                                            }, label, true, {
                                                fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                lineNumber: 136,
                                                columnNumber: 47
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                    className: "text-sm text-slate-500",
                                                    children: "LinkedIn"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 137,
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
                                                        lineNumber: 137,
                                                        columnNumber: 123
                                                    }, this) : "No disponible"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 137,
                                                    columnNumber: 72
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                    className: "text-sm text-slate-500",
                                                    children: "Currículum"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 138,
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
                                                        lineNumber: 138,
                                                        columnNumber: 119
                                                    }, this) : "No disponible"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 74
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 138,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 133,
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
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this),
                                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    role: message.kind === "error" ? "alert" : "status",
                                    className: `mt-4 rounded p-3 text-sm ${message.kind === "error" ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"}`,
                                    children: message.text
                                }, void 0, false, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 143,
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
                                                            lineNumber: 145,
                                                            columnNumber: 258
                                                        }, this),
                                                        Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["statusLabels"]).map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: value,
                                                                children: label
                                                            }, value, false, {
                                                                fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                                lineNumber: 145,
                                                                columnNumber: 367
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 80
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 145,
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
                                                            lineNumber: 146,
                                                            columnNumber: 315
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
                                                                lineNumber: 146,
                                                                columnNumber: 539
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                                    lineNumber: 146,
                                                    columnNumber: 106
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 146,
                                            columnNumber: 42
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: saving,
                                            className: "rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60",
                                            children: saving ? "Guardando..." : "Guardar cambios"
                                        }, void 0, false, {
                                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                                            lineNumber: 147,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notes$2f$notes$2d$section$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            candidateId: id
                        }, void 0, false, {
                            fileName: "[project]/components/candidates/candidate-detail.tsx",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/candidates/candidate-detail.tsx",
                    lineNumber: 128,
                    columnNumber: 16
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/components/candidates/candidate-detail.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/notes/notes-section.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NotesSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/notes.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function errorText(error) {
    return error instanceof Error ? error.message : "Error desconocido.";
}
function NotesSection({ candidateId }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        kind: "loading"
    });
    const [attempt, setAttempt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmId, setConfirmId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editContent, setEditContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        async function load() {
            setState({
                kind: "loading"
            });
            try {
                const notes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNotes"])(candidateId, controller.signal);
                if (!controller.signal.aborted) setState({
                    kind: "success",
                    notes
                });
            } catch (error) {
                if (!controller.signal.aborted) setState({
                    kind: "error",
                    message: errorText(error)
                });
            }
        }
        void load();
        return ()=>controller.abort();
    }, [
        candidateId,
        attempt
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (message?.kind !== "success") return;
        const timer = window.setTimeout(()=>setMessage(null), 4000);
        return ()=>window.clearTimeout(timer);
    }, [
        message
    ]);
    async function refreshNotes() {
        setState({
            kind: "loading"
        });
        try {
            setState({
                kind: "success",
                notes: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNotes"])(candidateId)
            });
        } catch (error) {
            setState({
                kind: "error",
                message: errorText(error)
            });
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        if (busy) return;
        const text = content.trim();
        if (!text) {
            setMessage({
                kind: "error",
                text: "Escribe una nota antes de enviarla."
            });
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createNote"])(candidateId, text);
            setContent("");
            setMessage({
                kind: "success",
                text: "Nota añadida correctamente."
            });
            await refreshNotes();
        } catch (error) {
            setMessage({
                kind: "error",
                text: `No se pudo añadir la nota. ${errorText(error)}`
            });
        } finally{
            setBusy(false);
        }
    }
    async function handleDelete(noteId) {
        if (busy) return;
        setBusy(true);
        setMessage(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteNote"])(candidateId, noteId);
            setConfirmId(null);
            setMessage({
                kind: "success",
                text: "Nota eliminada correctamente."
            });
            await refreshNotes();
        } catch (error) {
            setMessage({
                kind: "error",
                text: `No se pudo eliminar la nota. ${errorText(error)}`
            });
        } finally{
            setBusy(false);
        }
    }
    async function handleEdit(event, note) {
        event.preventDefault();
        if (busy) return;
        const text = editContent.trim();
        if (!text) {
            setMessage({
                kind: "error",
                text: "Escribe una nota antes de guardarla."
            });
            return;
        }
        if (text === note.content) {
            setEditingId(null);
            setMessage(null);
            return;
        }
        setBusy(true);
        setMessage(null);
        let replacementCreated = false;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createNote"])(candidateId, text);
            replacementCreated = true;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteNote"])(candidateId, note.id);
            setEditingId(null);
            setMessage({
                kind: "success",
                text: "Nota actualizada correctamente."
            });
            await refreshNotes();
        } catch (error) {
            if (replacementCreated) {
                setEditingId(null);
                setMessage({
                    kind: "error",
                    text: `La nota nueva se guardó, pero no se pudo confirmar la eliminación de la original. Revisa si hay notas duplicadas. ${errorText(error)}`
                });
            } else {
                setMessage({
                    kind: "error",
                    text: `No se pudo confirmar que se guardara la nota nueva. Revisa la lista antes de reintentar. ${errorText(error)}`
                });
            }
            await refreshNotes();
        } finally{
            setBusy(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "aria-labelledby": "notes-title",
        className: "mt-8 border-t border-slate-200 pt-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                id: "notes-title",
                className: "text-lg font-semibold",
                children: "Notas"
            }, void 0, false, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 133,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: message.kind === "error" ? "alert" : "status",
                className: `mt-4 rounded p-3 text-sm ${message.kind === "error" ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"}`,
                children: message.text
            }, void 0, false, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 134,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "note-content",
                        className: "text-sm font-medium text-slate-700",
                        children: "Nueva nota"
                    }, void 0, false, {
                        fileName: "[project]/components/notes/notes-section.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        id: "note-content",
                        value: content,
                        onChange: (event)=>setContent(event.target.value),
                        disabled: busy,
                        required: true,
                        rows: 3,
                        className: "mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-sm"
                    }, void 0, false, {
                        fileName: "[project]/components/notes/notes-section.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: busy,
                        className: "mt-3 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60",
                        children: busy ? "Procesando..." : "Añadir nota"
                    }, void 0, false, {
                        fileName: "[project]/components/notes/notes-section.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this),
            state.kind === "loading" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "py-6 text-sm text-slate-600",
                children: "Cargando notas..."
            }, void 0, false, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 140,
                columnNumber: 36
            }, this),
            state.kind === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: "mt-5 border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-900",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "No se pudieron cargar las notas. ",
                            state.message
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/notes/notes-section.tsx",
                        lineNumber: 141,
                        columnNumber: 130
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setAttempt((value)=>value + 1),
                        disabled: busy,
                        className: "mt-3 rounded border border-red-700 px-3 py-1.5 font-semibold",
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/components/notes/notes-section.tsx",
                        lineNumber: 141,
                        columnNumber: 185
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 141,
                columnNumber: 34
            }, this),
            state.kind === "success" && (state.notes.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "py-6 text-sm text-slate-600",
                children: "Todavía no hay notas."
            }, void 0, false, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 142,
                columnNumber: 64
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "mt-5 divide-y divide-slate-200 border-y border-slate-200",
                children: state.notes.map((note)=>{
                    const date = new Date(note.created_at);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "py-4",
                        children: [
                            editingId === note.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: (event)=>void handleEdit(event, note),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: `edit-note-${note.id}`,
                                        className: "text-sm font-medium text-slate-700",
                                        children: "Editar nota"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 146,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        id: `edit-note-${note.id}`,
                                        value: editContent,
                                        onChange: (event)=>setEditContent(event.target.value),
                                        disabled: busy,
                                        required: true,
                                        rows: 3,
                                        className: "mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-sm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 147,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: busy,
                                                className: "rounded bg-teal-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60",
                                                children: busy ? "Guardando..." : "Guardar nota"
                                            }, void 0, false, {
                                                fileName: "[project]/components/notes/notes-section.tsx",
                                                lineNumber: 148,
                                                columnNumber: 46
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: busy,
                                                onClick: ()=>setEditingId(null),
                                                className: "text-sm text-slate-700 underline",
                                                children: "Cancelar"
                                            }, void 0, false, {
                                                fileName: "[project]/components/notes/notes-section.tsx",
                                                lineNumber: 148,
                                                columnNumber: 230
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/notes/notes-section.tsx",
                                lineNumber: 145,
                                columnNumber: 36
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "whitespace-pre-wrap break-words text-sm text-slate-900",
                                children: note.content
                            }, void 0, false, {
                                fileName: "[project]/components/notes/notes-section.tsx",
                                lineNumber: 149,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-xs text-slate-500",
                                children: Number.isNaN(date.getTime()) ? note.created_at : new Intl.DateTimeFormat("es", {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                }).format(date)
                            }, void 0, false, {
                                fileName: "[project]/components/notes/notes-section.tsx",
                                lineNumber: 150,
                                columnNumber: 11
                            }, this),
                            editingId !== note.id && (confirmId === note.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex flex-wrap items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-red-900",
                                        children: "¿Eliminar esta nota?"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 151,
                                        columnNumber: 118
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: busy,
                                        onClick: ()=>void handleDelete(note.id),
                                        className: "rounded border border-red-700 px-3 py-1 text-sm font-semibold text-red-800 disabled:opacity-60",
                                        children: busy ? "Eliminando..." : "Confirmar eliminación"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 151,
                                        columnNumber: 184
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: busy,
                                        onClick: ()=>setConfirmId(null),
                                        className: "text-sm text-slate-700 underline",
                                        children: "Cancelar"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 151,
                                        columnNumber: 431
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/notes/notes-section.tsx",
                                lineNumber: 151,
                                columnNumber: 62
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: busy,
                                        onClick: ()=>{
                                            setEditingId(note.id);
                                            setEditContent(note.content);
                                            setConfirmId(null);
                                            setMessage(null);
                                        },
                                        className: "text-sm font-medium text-teal-800 underline disabled:opacity-60",
                                        children: "Editar nota"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 151,
                                        columnNumber: 608
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: busy,
                                        onClick: ()=>{
                                            setEditingId(null);
                                            setConfirmId(note.id);
                                        },
                                        className: "text-sm font-medium text-red-700 underline disabled:opacity-60",
                                        children: "Eliminar nota"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notes/notes-section.tsx",
                                        lineNumber: 151,
                                        columnNumber: 853
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/notes/notes-section.tsx",
                                lineNumber: 151,
                                columnNumber: 575
                            }, this))
                        ]
                    }, note.id, true, {
                        fileName: "[project]/components/notes/notes-section.tsx",
                        lineNumber: 144,
                        columnNumber: 16
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/notes/notes-section.tsx",
                lineNumber: 142,
                columnNumber: 135
            }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/notes/notes-section.tsx",
        lineNumber: 132,
        columnNumber: 5
    }, this);
}
}),
"[project]/services/candidates.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiUrl",
    ()=>apiUrl,
    "getCandidate",
    ()=>getCandidate,
    "getCandidates",
    ()=>getCandidates,
    "saveCandidate",
    ()=>saveCandidate,
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
async function saveCandidate(input, id) {
    const response = await fetch(apiUrl(id ? `/records/${encodeURIComponent(id)}` : "/records"), {
        method: id ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
    return await response.json();
}
}),
"[project]/services/notes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createNote",
    ()=>createNote,
    "deleteNote",
    ()=>deleteNote,
    "getNotes",
    ()=>getNotes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/candidates.ts [app-ssr] (ecmascript)");
;
function notesPath(candidateId) {
    return `/records/${encodeURIComponent(candidateId)}/notes`;
}
function checkResponse(response) {
    if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
}
async function getNotes(candidateId, signal) {
    const response = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiUrl"])(notesPath(candidateId)), {
        signal
    });
    checkResponse(response);
    const result = await response.json();
    if (!Array.isArray(result.data)) throw new Error("La API devolvió una respuesta inesperada.");
    return result.data;
}
async function createNote(candidateId, content) {
    const response = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiUrl"])(notesPath(candidateId)), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content
        })
    });
    checkResponse(response);
}
async function deleteNote(candidateId, noteId) {
    const response = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiUrl"])(`${notesPath(candidateId)}/${encodeURIComponent(noteId)}`), {
        method: "DELETE"
    });
    checkResponse(response);
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

//# sourceMappingURL=_1l-pnlk7-3efo._.js.map