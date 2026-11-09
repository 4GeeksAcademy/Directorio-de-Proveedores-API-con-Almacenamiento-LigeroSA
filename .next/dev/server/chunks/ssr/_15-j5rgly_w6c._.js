module.exports = [
"[project]/components/forms/candidate-form.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CandidateForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/candidates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/candidate.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const emptyFields = {
    full_name: "",
    email: "",
    phone: "",
    position: "",
    linkedin_url: "",
    cv_url: "",
    experience_years: ""
};
const positions = [
    "Administrativo",
    "Recepcionista",
    "Enfermero",
    "Médico",
    "Auxiliar de servicio"
];
const progressStages = [
    "review",
    "personal_interview",
    "technical_interview"
];
const inputClass = "mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100";
function validUrl(value) {
    if (!value) return true;
    try {
        return [
            "http:",
            "https:"
        ].includes(new URL(value).protocol);
    } catch  {
        return false;
    }
}
function CandidateForm({ candidateId }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [fields, setFields] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(emptyFields);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("received");
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("pending");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Boolean(candidateId));
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [attempt, setAttempt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [savedCandidate, setSavedCandidate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [creationUncertain, setCreationUncertain] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [submitError, setSubmitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!candidateId) return;
        const controller = new AbortController();
        async function load() {
            setLoading(true);
            setLoadError("");
            try {
                const candidate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCandidate"])(candidateId, controller.signal);
                if (controller.signal.aborted) return;
                setFields({
                    full_name: candidate.full_name,
                    email: candidate.email,
                    phone: candidate.phone,
                    position: candidate.position,
                    linkedin_url: candidate.linkedin_url ?? "",
                    cv_url: candidate.cv_url ?? "",
                    experience_years: String(candidate.experience_years)
                });
                setStatus(candidate.status);
                setStage(candidate.stage);
            } catch (error) {
                if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Error desconocido.");
            } finally{
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        return ()=>controller.abort();
    }, [
        candidateId,
        attempt
    ]);
    function updateField(name, value) {
        setFields((current)=>({
                ...current,
                [name]: value
            }));
        setErrors((current)=>({
                ...current,
                [name]: undefined
            }));
    }
    function changeStatus(value) {
        setStatus(value);
        if (value === "received") setStage("pending");
        else if (value === "selected") setStage("offer_presented");
        else if (value === "in_progress") setStage("");
        setErrors((current)=>({
                ...current,
                stage: undefined
            }));
    }
    async function handleSubmit(event) {
        event.preventDefault();
        if (saving || creationUncertain) return;
        const nextErrors = {};
        if (!fields.full_name.trim()) nextErrors.full_name = "Introduce el nombre completo.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) nextErrors.email = "Introduce un correo válido.";
        if (!fields.phone.trim()) nextErrors.phone = "Introduce el teléfono.";
        if (!fields.position.trim()) nextErrors.position = "Selecciona un puesto.";
        if (!fields.experience_years.trim() || !Number.isFinite(Number(fields.experience_years)) || Number(fields.experience_years) <= 0) nextErrors.experience_years = "Introduce un número positivo.";
        if (!validUrl(fields.linkedin_url.trim())) nextErrors.linkedin_url = "Introduce una URL válida con http o https.";
        if (!validUrl(fields.cv_url.trim())) nextErrors.cv_url = "Introduce una URL válida con http o https.";
        if (status !== "discarded" && (!stage || status === "in_progress" && !progressStages.includes(stage))) nextErrors.stage = "Selecciona una etapa.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        const input = {
            full_name: fields.full_name.trim(),
            email: fields.email.trim(),
            phone: fields.phone.trim(),
            position: fields.position.trim(),
            linkedin_url: fields.linkedin_url.trim() || null,
            cv_url: fields.cv_url.trim() || null,
            experience_years: Number(fields.experience_years)
        };
        setSaving(true);
        setSubmitError("");
        let saved = savedCandidate;
        try {
            saved = saved ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveCandidate"])(input, candidateId);
            if (!savedCandidate) setSavedCandidate(saved);
            if (saved.status !== status || status !== "discarded" && saved.stage !== stage) {
                if (status === "discarded") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateCandidateProgress"])(saved.id, {
                    status
                });
                else if (stage) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateCandidateProgress"])(saved.id, {
                    status,
                    stage
                });
            }
            router.push(`/candidates/${encodeURIComponent(saved.id)}?result=${candidateId ? "updated" : "created"}`);
        } catch (error) {
            const definitelyRejected = error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$candidates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CandidateSaveError"] && error.status >= 400 && error.status < 500 && error.status !== 408;
            if (!candidateId && !saved && !definitelyRejected) {
                setCreationUncertain(true);
                setSubmitError("No se pudo confirmar si la candidatura se creó. Revisa el listado antes de volver a intentarlo para evitar duplicados.");
            } else {
                setSubmitError(`No se pudo completar el envío. ${error instanceof Error ? error.message : "Error desconocido."}`);
            }
        } finally{
            setSaving(false);
        }
    }
    const controls = [
        {
            name: "full_name",
            label: "Nombre completo",
            required: true
        },
        {
            name: "email",
            label: "Correo electrónico",
            type: "email",
            required: true
        },
        {
            name: "phone",
            label: "Teléfono",
            type: "tel",
            required: true
        },
        {
            name: "experience_years",
            label: "Años de experiencia",
            type: "number",
            required: true
        },
        {
            name: "linkedin_url",
            label: "LinkedIn",
            type: "url"
        },
        {
            name: "cv_url",
            label: "Enlace al currículum",
            type: "url"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "mx-auto min-h-screen max-w-4xl px-6 py-10 sm:px-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-slate-200 pb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg font-semibold text-teal-700",
                        children: "HealthCore"
                    }, void 0, false, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 135,
                        columnNumber: 56
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: candidateId ? `/candidates/${encodeURIComponent(candidateId)}` : "/",
                        className: "mt-3 inline-block text-sm font-medium text-teal-800 underline-offset-4 hover:underline",
                        children: "Volver"
                    }, void 0, false, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 135,
                        columnNumber: 121
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/forms/candidate-form.tsx",
                lineNumber: 135,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "mt-8 text-2xl font-semibold",
                children: candidateId ? "Editar candidatura" : "Nueva candidatura"
            }, void 0, false, {
                fileName: "[project]/components/forms/candidate-form.tsx",
                lineNumber: 136,
                columnNumber: 5
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "status",
                className: "space-y-3 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Cargando candidatura..."
                    }, void 0, false, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 137,
                        columnNumber: 63
                    }, this),
                    [
                        1,
                        2,
                        3
                    ].map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-12 animate-pulse rounded bg-slate-200"
                        }, row, false, {
                            fileName: "[project]/components/forms/candidate-form.tsx",
                            lineNumber: 137,
                            columnNumber: 117
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/forms/candidate-form.tsx",
                lineNumber: 137,
                columnNumber: 17
            }, this),
            loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: "mt-5 bg-red-50 p-4 text-sm text-red-900",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "No se pudo cargar la candidatura. ",
                            loadError
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 138,
                        columnNumber: 89
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setAttempt((value)=>value + 1),
                        className: "mt-3 rounded border border-red-700 px-3 py-1.5",
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 138,
                        columnNumber: 141
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/forms/candidate-form.tsx",
                lineNumber: 138,
                columnNumber: 19
            }, this),
            !loading && !loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                noValidate: true,
                onSubmit: handleSubmit,
                className: "mt-6",
                children: [
                    submitError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "alert",
                        className: "mb-5 bg-red-50 p-4 text-sm text-red-900",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: submitError
                            }, void 0, false, {
                                fileName: "[project]/components/forms/candidate-form.tsx",
                                lineNumber: 140,
                                columnNumber: 93
                            }, this),
                            savedCandidate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2",
                                children: [
                                    "Los datos ya se guardaron. Puedes reintentar el cambio de estado o ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/candidates/${encodeURIComponent(savedCandidate.id)}`,
                                        className: "underline",
                                        children: "abrir la candidatura"
                                    }, void 0, false, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 140,
                                        columnNumber: 219
                                    }, this),
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/forms/candidate-form.tsx",
                                lineNumber: 140,
                                columnNumber: 132
                            }, this),
                            creationUncertain && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex flex-wrap gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/?search=${encodeURIComponent(fields.email.trim())}`,
                                        className: "font-semibold underline",
                                        children: "Buscar candidatura por correo"
                                    }, void 0, false, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 140,
                                        columnNumber: 407
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            setCreationUncertain(false);
                                            setSubmitError("");
                                        },
                                        className: "font-semibold underline",
                                        children: "Ya revisé el listado, permitir otro intento"
                                    }, void 0, false, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 140,
                                        columnNumber: 546
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/forms/candidate-form.tsx",
                                lineNumber: 140,
                                columnNumber: 364
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 140,
                        columnNumber: 23
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        disabled: saving || Boolean(savedCandidate) || creationUncertain,
                        className: "grid gap-5 sm:grid-cols-2",
                        children: [
                            controls.map(({ name, label, type, required })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-sm font-medium text-slate-700",
                                    children: [
                                        label,
                                        required && " *",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: type ?? "text",
                                            value: fields[name],
                                            onChange: (event)=>updateField(name, event.target.value),
                                            "aria-invalid": Boolean(errors[name]),
                                            "aria-describedby": errors[name] ? `${name}-error` : undefined,
                                            required: required,
                                            min: type === "number" ? "0.01" : undefined,
                                            step: type === "number" ? "any" : undefined,
                                            className: inputClass
                                        }, void 0, false, {
                                            fileName: "[project]/components/forms/candidate-form.tsx",
                                            lineNumber: 142,
                                            columnNumber: 150
                                        }, this),
                                        errors[name] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            id: `${name}-error`,
                                            className: "mt-1 block text-sm text-red-700",
                                            children: errors[name]
                                        }, void 0, false, {
                                            fileName: "[project]/components/forms/candidate-form.tsx",
                                            lineNumber: 142,
                                            columnNumber: 511
                                        }, this)
                                    ]
                                }, name, true, {
                                    fileName: "[project]/components/forms/candidate-form.tsx",
                                    lineNumber: 142,
                                    columnNumber: 60
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm font-medium text-slate-700",
                                children: [
                                    "Puesto *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: fields.position,
                                        onChange: (event)=>updateField("position", event.target.value),
                                        required: true,
                                        "aria-invalid": Boolean(errors.position),
                                        "aria-describedby": errors.position ? "position-error" : undefined,
                                        className: inputClass,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Selecciona un puesto"
                                            }, void 0, false, {
                                                fileName: "[project]/components/forms/candidate-form.tsx",
                                                lineNumber: 143,
                                                columnNumber: 307
                                            }, this),
                                            fields.position && !positions.includes(fields.position) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: fields.position,
                                                children: fields.position
                                            }, void 0, false, {
                                                fileName: "[project]/components/forms/candidate-form.tsx",
                                                lineNumber: 143,
                                                columnNumber: 413
                                            }, this),
                                            positions.map((position)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: position,
                                                    children: position
                                                }, position, false, {
                                                    fileName: "[project]/components/forms/candidate-form.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 501
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 143,
                                        columnNumber: 71
                                    }, this),
                                    errors.position && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        id: "position-error",
                                        className: "mt-1 block text-sm text-red-700",
                                        children: errors.position
                                    }, void 0, false, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 143,
                                        columnNumber: 591
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/forms/candidate-form.tsx",
                                lineNumber: 143,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 141,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-5 grid gap-5 sm:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm font-medium text-slate-700",
                                children: [
                                    "Estado *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: status,
                                        onChange: (event)=>changeStatus(event.target.value),
                                        disabled: saving || creationUncertain,
                                        className: inputClass,
                                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["statusLabels"]).map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: value,
                                                children: label
                                            }, value, false, {
                                                fileName: "[project]/components/forms/candidate-form.tsx",
                                                lineNumber: 146,
                                                columnNumber: 284
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 146,
                                        columnNumber: 71
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/forms/candidate-form.tsx",
                                lineNumber: 146,
                                columnNumber: 9
                            }, this),
                            status !== "discarded" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm font-medium text-slate-700",
                                children: [
                                    "Etapa *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: stage,
                                        onChange: (event)=>setStage(event.target.value),
                                        disabled: saving || creationUncertain || status !== "in_progress",
                                        "aria-invalid": Boolean(errors.stage),
                                        "aria-describedby": errors.stage ? "stage-error" : undefined,
                                        className: inputClass,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                disabled: true,
                                                children: "Selecciona una etapa"
                                            }, void 0, false, {
                                                fileName: "[project]/components/forms/candidate-form.tsx",
                                                lineNumber: 147,
                                                columnNumber: 375
                                            }, this),
                                            (status === "in_progress" ? progressStages : status === "received" ? [
                                                "pending"
                                            ] : [
                                                "offer_presented"
                                            ]).map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: value,
                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$candidate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stageLabels"][value]
                                                }, value, false, {
                                                    fileName: "[project]/components/forms/candidate-form.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 568
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 147,
                                        columnNumber: 97
                                    }, this),
                                    errors.stage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        id: "stage-error",
                                        className: "mt-1 block text-sm text-red-700",
                                        children: errors.stage
                                    }, void 0, false, {
                                        fileName: "[project]/components/forms/candidate-form.tsx",
                                        lineNumber: 147,
                                        columnNumber: 659
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/forms/candidate-form.tsx",
                                lineNumber: 147,
                                columnNumber: 36
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 145,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: saving || creationUncertain,
                        className: "mt-6 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60",
                        children: saving ? "Guardando..." : savedCandidate ? "Reintentar actualización" : "Guardar candidatura"
                    }, void 0, false, {
                        fileName: "[project]/components/forms/candidate-form.tsx",
                        lineNumber: 149,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/forms/candidate-form.tsx",
                lineNumber: 139,
                columnNumber: 32
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/forms/candidate-form.tsx",
        lineNumber: 134,
        columnNumber: 10
    }, this);
}
}),
"[project]/services/candidates.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CandidateSaveError",
    ()=>CandidateSaveError,
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
class CandidateSaveError extends Error {
    status;
    constructor(status){
        super(`La API respondió con el código ${status}.`), this.status = status;
        this.name = "CandidateSaveError";
    }
}
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
    if (!response.ok) throw new CandidateSaveError(response.status);
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

//# sourceMappingURL=_15-j5rgly_w6c._.js.map