import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, Pill } from '@deepseek-ai/dsh-client-ui-primitives';
import styles from './DesignCenterView.module.css';
function svgDataUrl(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function pad2(n) { return n < 10 ? '0' + n : String(n); }
function formatDateTime(value) {
    if (!value)
        return '';
    const trimmed = value.trim();
    if (!trimmed)
        return '';
    if (/^\d{4}[-/.]\d{2}[-/.]\d{2}[ T]\d{1,2}:\d{2}/.test(trimmed)) {
        const m = trimmed.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})[ T](\d{1,2}):(\d{2})/);
        if (m)
            return `${m[1]}-${m[2]}-${m[3]} ${pad2(Number(m[4]))}:${m[5]}`;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())} ${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
    }
    return trimmed;
}
function diagramType(d) {
    return d.meta?.type ?? 'unknown';
}
function findByType(diagrams, type) {
    return diagrams.find(d => diagramType(d) === type);
}
function findFlows(diagrams) {
    return diagrams.filter(d => diagramType(d) === 'flow');
}
const STATUS_LABEL = {
    planned: '待开发',
    in_progress: '进行中',
    done: '已完成',
};
const STATUS_CLASS = {
    planned: 'stPlanned',
    in_progress: 'stProgress',
    done: 'stDone',
};
function statusLabel(s) {
    if (!s)
        return '';
    return STATUS_LABEL[s] ?? s;
}
function statusClass(s) {
    if (!s)
        return styles.stPlanned ?? '';
    const key = STATUS_CLASS[s];
    if (key === 'stPlanned')
        return styles.stPlanned ?? '';
    if (key === 'stProgress')
        return styles.stProgress ?? '';
    if (key === 'stDone')
        return styles.stDone ?? '';
    return styles.stPlanned ?? '';
}
function DiagramVersionFooter(props) {
    const { diagram } = props;
    const m = diagram.meta;
    return (_jsxs("div", { className: styles.versionFooter, children: [_jsxs("div", { className: styles.versionLines, children: [_jsxs("span", { className: styles.ver, children: ["v", m?.version ?? '1.0.0'] }), m?.updatedAt ? _jsxs("span", { className: styles.verDate, children: ["\u66F4\u65B0\u4E8E ", formatDateTime(m.updatedAt)] }) : null, m?.status && m.status !== 'stable' ? (_jsx("span", { className: `${styles.verStatus} ${statusClass(m.status)}`, children: m.status })) : null] }), m?.changes ? _jsx("p", { className: styles.changes, children: m.changes }) : null] }));
}
function DiagramCard(props) {
    const { diagram, t, draft, onEdit, onSave, onCancel, showTitle = true } = props;
    const title = diagram.title || diagram.id;
    const editing = draft !== undefined;
    const svgMissing = diagram.svg === null;
    return (_jsxs("div", { className: styles.diagramCard, children: [_jsxs("div", { className: styles.diagramHeader, children: [showTitle ? _jsx("span", { className: styles.diagramTitle, children: title }) : _jsx("span", {}), !editing ? (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => onEdit(diagram.specText), children: t('toolbar.edit') })) : (_jsxs("div", { className: styles.editorActions, children: [_jsx(Button, { size: "sm", variant: "primary", onClick: onSave, children: t('toolbar.save') }), _jsx(Button, { size: "sm", variant: "ghost", onClick: onCancel, children: t('toolbar.cancel') })] }))] }), editing ? (_jsx("textarea", { className: styles.editor, value: draft, onChange: e => onEdit(e.target.value), spellCheck: false })) : diagram.svg ? (_jsx("div", { className: styles.svgWrap, children: _jsx("img", { className: styles.svgImg, src: svgDataUrl(diagram.svg), alt: title }) })) : (_jsx("pre", { className: styles.renderLog, children: diagram.specText || '(empty spec)' })), svgMissing && !editing ? (_jsx("div", { className: styles.svgMissingHint, children: "\u672A\u627E\u5230\u6E32\u67D3\u540E\u7684 SVG\uFF08\u70B9\u51FB\u91CD\u65B0\u6E32\u67D3\uFF09" })) : null, !editing ? _jsx(DiagramVersionFooter, { diagram: diagram }) : null] }));
}
function FlowList(props) {
    const { flows, selectedId, onSelect } = props;
    return (_jsxs("aside", { className: styles.flowSide, children: [_jsxs("div", { className: styles.flowSideHead, children: ["\u4E1A\u52A1\u6D41\u7A0B\uFF08", flows.length, "\uFF09"] }), _jsx("div", { className: styles.flowSideList, children: flows.map((f) => {
                    const active = f.id === selectedId;
                    return (_jsxs("button", { type: "button", className: `${styles.flowItem} ${active ? styles.flowItemActive : ''}`, onClick: () => onSelect(f.id), children: [_jsx("span", { className: styles.flowItemTitle, children: f.title || f.id }), _jsxs("span", { className: styles.flowItemMeta, children: [_jsxs("span", { children: ["v", f.meta?.version ?? '1.0.0'] }), f.meta?.updatedAt ? _jsx("span", { children: formatDateTime(f.meta.updatedAt) }) : null] })] }, f.id));
                }) })] }));
}
function moduleProgress(m) {
    if (typeof m.progress === 'number' && Number.isFinite(m.progress)) {
        return Math.max(0, Math.min(100, Math.round(m.progress)));
    }
    const tasks = m.tasks;
    if (tasks && tasks.length > 0) {
        const done = tasks.filter(t => t.done).length;
        return Math.round((done * 100) / tasks.length);
    }
    return 0;
}
function PlanSideItem(props) {
    const { m, active, isLatest, onClick } = props;
    const pct = moduleProgress(m);
    const prio = (m.priority ?? '').toUpperCase();
    return (_jsxs("button", { type: "button", className: `${styles.planItem} ${active ? styles.planItemActive : ''}`, onClick: onClick, children: [_jsx("span", { className: styles.planItemTitle, children: m.name ?? m.id ?? '(未命名)' }), _jsxs("span", { className: styles.planItemMeta, children: [_jsx("span", { className: `${styles.planDot} ${statusClass(m.status)}` }), _jsx("span", { children: statusLabel(m.status) || '—' }), prio ? _jsx("span", { className: `${styles.prioPill} ${styles['prio' + prio]}`, children: prio }) : null, isLatest ? _jsx("span", { className: styles.latestBadge, children: "\u6700\u65B0" }) : null] }), _jsxs("span", { className: styles.planItemProgress, children: [_jsx("span", { className: styles.miniBar, children: _jsx("span", { className: styles.miniFill, style: { width: pct + '%' } }) }), _jsxs("span", { className: styles.miniPct, children: [pct, "%"] })] })] }));
}
function PlanDetail(props) {
    const { m, isLatest, diagramById, onJumpDiagram } = props;
    const pct = moduleProgress(m);
    const tasks = m.tasks ?? [];
    const doneTasks = tasks.filter(t => t.done).length;
    const refs = [];
    const arch = m.archRef ? diagramById(m.archRef) : undefined;
    if (arch) {
        refs.push(_jsxs("button", { type: "button", className: `${styles.refChip} ${styles.refChipArch}`, onClick: () => onJumpDiagram(arch.id), children: ["\u67B6\u6784\u56FE", arch.meta?.version ? ` · v${arch.meta.version}` : ''] }, "arch"));
    }
    const mods = m.modulesRef ? diagramById(m.modulesRef) : undefined;
    if (mods) {
        refs.push(_jsxs("button", { type: "button", className: `${styles.refChip} ${styles.refChipMod}`, onClick: () => onJumpDiagram(mods.id), children: ["\u6A21\u5757\u56FE", mods.meta?.version ? ` · v${mods.meta.version}` : ''] }, "mods"));
    }
    for (const fid of m.flows ?? []) {
        const fl = diagramById(fid);
        refs.push(_jsxs("button", { type: "button", className: `${styles.refChip} ${styles.refChipFlow}`, onClick: () => onJumpDiagram(fid), children: ["\u6D41\u7A0B \u00B7 ", fl ? fl.title || fl.id : fid, fl?.meta?.version ? ` · v${fl.meta.version}` : ''] }, 'f:' + fid));
    }
    return (_jsxs("div", { className: styles.planDetail, children: [_jsxs("div", { className: styles.planDetailHead, children: [_jsx("h3", { children: m.name ?? m.id ?? '(未命名)' }), _jsxs("div", { className: styles.planBadges, children: [_jsx("span", { className: `${styles.badge} ${statusClass(m.status)}`, children: statusLabel(m.status) || '待开发' }), isLatest ? _jsx("span", { className: styles.badgeLatest, children: "\u6700\u65B0" }) : null] })] }), m.summary ? _jsx("p", { className: styles.planSummary, children: m.summary }) : null, _jsxs("div", { className: styles.planLines, children: [m.priority ? _jsx("span", { className: styles.prioTag, children: m.priority }) : null, m.updatedAt ? _jsxs("span", { children: ["\u66F4\u65B0\u4E8E ", formatDateTime(m.updatedAt)] }) : null, m.owner ? _jsxs("span", { children: ["\u8D1F\u8D23\u4EBA\uFF1A", m.owner] }) : null, m.planDoc ? _jsx("span", { className: styles.planDocHint, title: m.planDoc, children: "\u660E\u7EC6\u8BA1\u5212\u5F85\u8865" }) : null] }), _jsxs("div", { className: styles.progressRow, children: [_jsx("div", { className: styles.progressBar, children: _jsx("span", { className: `${styles.progressFill} ${statusClass(m.status)}`, style: { width: pct + '%' } }) }), _jsxs("span", { className: styles.progressPct, children: [pct, "%"] })] }), _jsxs("div", { className: styles.planBlock, children: [_jsx("h4", { children: "\u5173\u8054\u56FE\uFF08\u67B6\u6784 / \u6A21\u5757 / \u6D41\u7A0B\u5BF9\u9F50\uFF09" }), _jsx("div", { className: styles.refChips, children: refs.length > 0 ? refs : _jsx("span", { className: styles.muted, children: "\u65E0" }) })] }), tasks.length > 0 ? (_jsxs("div", { className: styles.planBlock, children: [_jsxs("h4", { children: ["\u4EFB\u52A1\u6E05\u5355\uFF08", doneTasks, "/", tasks.length, "\uFF09"] }), _jsx("ul", { className: styles.tasks, children: tasks.map((t, i) => (_jsxs("li", { className: t.done ? styles.taskDone : '', children: [_jsx("span", { className: styles.tick, children: t.done ? '✓' : '○' }), _jsx("span", { children: t.text })] }, i))) })] })) : null] }));
}
export function DesignCenterView(props) {
    const { controller, sessionId, useSessions, t } = props;
    const cwd = useSessions(list => list.byId[sessionId]?.cwd);
    const state = useSyncExternalStore(controller.store.subscribe, () => controller.store.getSnapshot(), () => controller.store.getSnapshot());
    const [subTab, setSubTab] = useState('architecture');
    const [selectedFlow, setSelectedFlow] = useState(null);
    const [selectedModule, setSelectedModule] = useState(0);
    const [editingPlan, setEditingPlan] = useState(false);
    useEffect(() => {
        if (cwd)
            void controller.load(sessionId);
    }, [controller, sessionId, cwd]);
    const board = state.board;
    const busy = state.status === 'loading' || state.status === 'rendering';
    const subTabs = useMemo(() => [
        { id: 'architecture', label: t('tab.architecture') },
        { id: 'modules', label: t('tab.modules') },
        { id: 'flows', label: t('tab.flows') },
        { id: 'plan', label: t('tab.plan') },
    ], [t]);
    const flows = useMemo(() => board ? findFlows(board.diagrams) : [], [board]);
    const architecture = useMemo(() => board ? findByType(board.diagrams, 'architecture') : undefined, [board]);
    const modules = useMemo(() => board ? findByType(board.diagrams, 'modules') : undefined, [board]);
    useEffect(() => {
        if (flows.length === 0) {
            setSelectedFlow(null);
            return;
        }
        if (!selectedFlow || !flows.some(f => f.id === selectedFlow)) {
            const first = flows[0];
            if (first)
                setSelectedFlow(first.id);
        }
    }, [flows, selectedFlow]);
    const planModules = board?.plan?.modules ?? [];
    useEffect(() => {
        if (selectedModule >= planModules.length)
            setSelectedModule(0);
    }, [planModules.length, selectedModule]);
    const latestModuleDate = useMemo(() => {
        let max = null;
        for (const m of planModules) {
            const d = m.updatedAt;
            if (d && (!max || d > max))
                max = d;
        }
        return max;
    }, [planModules]);
    const diagramById = (id) => board?.diagrams.find(d => d.id === id);
    const jumpToDiagram = (id) => {
        if (!board)
            return;
        const d = board.diagrams.find(x => x.id === id);
        if (!d)
            return;
        const ty = diagramType(d);
        if (ty === 'architecture')
            setSubTab('architecture');
        else if (ty === 'modules')
            setSubTab('modules');
        else if (ty === 'flow') {
            setSelectedFlow(d.id);
            setSubTab('flows');
        }
    };
    if (!cwd) {
        return (_jsx("div", { className: styles.designCenter, children: _jsx("div", { className: [styles.statusBanner, styles.statusInfo].filter(Boolean).join(' '), children: t('status.noCwd') }) }));
    }
    const renderButton = (_jsx(Button, { size: "sm", variant: "primary", disabled: busy || !board, onClick: () => void controller.render(sessionId), children: state.status === 'rendering' ? t('status.rendering') : t('toolbar.render') }));
    const activeFlow = selectedFlow ? flows.find(f => f.id === selectedFlow) : undefined;
    return (_jsxs("div", { className: styles.designCenter, children: [_jsxs("div", { className: styles.header, children: [_jsx("div", { className: styles.tabBar, children: subTabs.map(tab => (_jsx("button", { type: "button", className: [styles.tabButton, tab.id === subTab && styles.tabButtonActive].filter(Boolean).join(' '), onClick: () => setSubTab(tab.id), children: tab.label }, tab.id))) }), _jsxs("div", { className: styles.headerActions, children: [_jsx(Button, { size: "sm", variant: "ghost", disabled: busy, onClick: () => void controller.load(sessionId, true), children: t('toolbar.refresh') }), renderButton] })] }), _jsxs("div", { className: styles.content, children: [state.error ? (_jsx("div", { className: [styles.statusBanner, styles.statusError].filter(Boolean).join(' '), children: state.error })) : null, state.status === 'loading' ? (_jsx("div", { className: [styles.statusBanner, styles.statusInfo].filter(Boolean).join(' '), children: t('status.loading') })) : null, !board && state.status === 'ready' ? (_jsxs("div", { className: styles.empty, children: [_jsx("div", { className: styles.emptyTitle, children: t('empty.title') }), _jsx("div", { className: styles.emptyBody, children: t('empty.body') })] })) : null, board && (subTab === 'architecture' || subTab === 'modules') ? (() => {
                        const diagram = subTab === 'architecture' ? architecture : modules;
                        if (!diagram) {
                            return _jsx("div", { className: styles.empty, children: _jsx("div", { className: styles.emptyTitle, children: t('empty.title') }) });
                        }
                        const draft = state.drafts[diagram.id];
                        return (_jsx(DiagramCard, { diagram: diagram, t: t, draft: draft, onEdit: text => controller.updateDraft(diagram.id, text), onSave: () => {
                                void controller.saveSpec(sessionId, diagram.id).then((ok) => {
                                    if (ok)
                                        return controller.load(sessionId, true);
                                });
                            }, onCancel: () => controller.clearDraft(diagram.id) }));
                    })() : null, board && subTab === 'flows' ? (flows.length > 0 && activeFlow ? (_jsxs("div", { className: styles.flowLayout, children: [_jsx(FlowList, { flows: flows, selectedId: activeFlow.id, onSelect: setSelectedFlow }), _jsx("div", { className: styles.flowMain, children: _jsx(DiagramCard, { diagram: activeFlow, t: t, draft: state.drafts[activeFlow.id], onEdit: text => controller.updateDraft(activeFlow.id, text), onSave: () => {
                                        void controller.saveSpec(sessionId, activeFlow.id).then((ok) => {
                                            if (ok)
                                                return controller.load(sessionId, true);
                                        });
                                    }, onCancel: () => controller.clearDraft(activeFlow.id), showTitle: false }, activeFlow.id) })] })) : (_jsx("div", { className: styles.empty, children: _jsx("div", { className: styles.emptyTitle, children: "\u6682\u65E0\u4E1A\u52A1\u6D41\u7A0B\u56FE" }) }))) : null, board && subTab === 'plan' ? (() => {
                        const plan = board.plan;
                        if (!plan) {
                            return _jsx("div", { className: styles.empty, children: _jsx("div", { className: styles.emptyTitle, children: "plan.json not found" }) });
                        }
                        return (_jsxs("div", { className: styles.planCard, children: [_jsxs("div", { className: styles.diagramHeader, children: [_jsxs("span", { className: styles.planHeadTitle, children: ["\u5F00\u53D1\u8BA1\u5212 \u00B7 v", plan.version ?? '1.0.0', plan.updatedAt ? ` · 更新于 ${formatDateTime(plan.updatedAt)}` : ''] }), !editingPlan ? (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => { controller.updatePlanDraft(plan.text); setEditingPlan(true); }, children: t('toolbar.edit') })) : (_jsxs("div", { className: styles.editorActions, children: [_jsx(Button, { size: "sm", variant: "primary", onClick: () => {
                                                        void controller.savePlan(sessionId).then((ok) => {
                                                            if (ok) {
                                                                setEditingPlan(false);
                                                                return controller.load(sessionId, true);
                                                            }
                                                        });
                                                    }, children: t('toolbar.save') }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { controller.clearPlanDraft(); setEditingPlan(false); }, children: t('toolbar.cancel') })] }))] }), editingPlan ? (_jsx("textarea", { className: styles.editor, value: state.planDraft ?? plan.text, onChange: e => controller.updatePlanDraft(e.target.value), spellCheck: false })) : planModules.length > 0 ? (_jsxs("div", { className: styles.flowLayout, children: [_jsxs("aside", { className: styles.flowSide, children: [_jsxs("div", { className: styles.flowSideHead, children: ["\u8BA1\u5212\u6A21\u5757\uFF08", planModules.length, "\uFF09"] }), _jsx("div", { className: styles.flowSideList, children: planModules.map((m, i) => (_jsx(PlanSideItem, { m: m, active: i === selectedModule, isLatest: !!m.updatedAt && m.updatedAt === latestModuleDate, onClick: () => setSelectedModule(i) }, m.id ?? String(i)))) })] }), _jsx("div", { className: styles.flowMain, children: (() => {
                                                const sel = planModules[selectedModule];
                                                if (!sel)
                                                    return null;
                                                return (_jsx(PlanDetail, { m: sel, isLatest: !!sel.updatedAt && sel.updatedAt === latestModuleDate, diagramById: diagramById, onJumpDiagram: jumpToDiagram }));
                                            })() })] })) : (_jsx("div", { className: styles.empty, children: _jsx("div", { className: styles.emptyTitle, children: "plan.json \u4E2D\u8FD8\u6CA1\u6709\u6A21\u5757" }) }))] }));
                    })() : null, state.renderOutput ? (_jsxs("div", { className: styles.diagramCard, children: [_jsxs("div", { className: styles.diagramHeader, children: [_jsx("span", { className: styles.diagramTitle, children: "Render output" }), _jsxs(Pill, { children: ["exit ", state.renderOutput.exitCode] })] }), state.renderOutput.stdout ? _jsx("pre", { className: styles.renderLog, children: state.renderOutput.stdout }) : null, state.renderOutput.stderr ? _jsx("pre", { className: styles.renderLog, children: state.renderOutput.stderr }) : null] })) : null] })] }));
}
//# sourceMappingURL=DesignCenterView.js.map