/**
 * Host entry for the design-center plugin.
 *
 * Registers a dedicated RPC channel `/design-center` (independent of the
 * reserved singleton `/api` interceptor) so the browser tab can read/write
 * the workspace board and trigger python re-renders.
 */
import { existsSync, promises as fsp } from 'node:fs';
import { join as pathJoin } from 'node:path';
const CHANNEL = '/design-center';
const DIAGRAMS_DIR = 'docs/design/diagrams';
export const inject = ['connection', 'agents', 'fs', 'shell'];
function ok(value) { return { ok: true, value }; }
function fail(code, message, details = {}) {
    return { ok: false, error: { code, message, details: details } };
}
function asRecord(value) {
    return (value !== null && typeof value === 'object') ? value : {};
}
function parseArgs(payload) {
    const envelope = payload;
    return (envelope?.args ?? asRecord(payload));
}
function asString(v) {
    return typeof v === 'string' && v.length > 0 ? v : undefined;
}
function pad2(n) { return n < 10 ? '0' + n : String(n); }
function formatLocalMinute(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
const DATE_ONLY_RE = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\s*$/;
function isDateOnly(value) {
    return DATE_ONLY_RE.test(value.trim());
}
async function realMtime(absPath) {
    try {
        const st = await fsp.stat(absPath);
        return formatLocalMinute(st.mtime);
    }
    catch {
        return undefined;
    }
}
function parseSpec(text) {
    try {
        const parsed = JSON.parse(text);
        const rawMeta = asRecord(parsed.meta);
        const rawTitle = asRecord(parsed.title);
        const typeVal = asString(rawMeta.type);
        const metaType = (typeVal === 'architecture' || typeVal === 'modules' || typeVal === 'flow')
            ? typeVal
            : 'unknown';
        const nameVal = asString(rawMeta.name);
        const titleVal = asString(rawMeta.title);
        const versionVal = asString(rawMeta.version) ?? '1.0.0';
        const updatedAtVal = asString(rawMeta.updated_at) ?? asString(rawMeta.updatedAt);
        const changesVal = asString(rawMeta.changes);
        const statusVal = asString(rawMeta.status);
        const accentVal = asString(rawMeta.accent);
        const meta = {
            type: metaType,
            ...(nameVal ? { name: nameVal } : {}),
            ...(titleVal ? { title: titleVal } : {}),
            ...(versionVal ? { version: versionVal } : {}),
            ...(updatedAtVal ? { updatedAt: updatedAtVal } : {}),
            ...(changesVal ? { changes: changesVal } : {}),
            ...(statusVal ? { status: statusVal } : {}),
            ...(accentVal ? { accent: accentVal } : {}),
        };
        const highlight = asString(rawTitle.highlight);
        const prefix = asString(rawTitle.prefix);
        const title = highlight ?? meta.title ?? meta.name ?? prefix ?? '';
        return { meta, title };
    }
    catch {
        return { meta: null, title: '' };
    }
}
function parsePlanTasks(value) {
    if (!Array.isArray(value))
        return [];
    return value.map((item) => {
        const rec = asRecord(item);
        return {
            text: asString(rec.text) ?? '',
            done: Boolean(rec.done),
        };
    }).filter(t => t.text.length > 0);
}
function parsePlan(text) {
    try {
        const parsed = JSON.parse(text);
        const rawModules = Array.isArray(parsed.modules) ? parsed.modules : [];
        const modules = rawModules.map((item) => {
            const m = asRecord(item);
            const flowsVal = Array.isArray(m.flows) ? m.flows.filter((f) => typeof f === 'string') : [];
            const progressVal = typeof m.progress === 'number' ? m.progress : undefined;
            const idv = asString(m.id);
            const nv = asString(m.name);
            const stv = asString(m.status);
            const pv = asString(m.priority);
            const ov = asString(m.owner);
            const uav = asString(m.updated_at) ?? asString(m.updatedAt);
            const sv = asString(m.summary);
            const arv = asString(m.arch_ref);
            const mrv = asString(m.modules_ref);
            const pdv = asString(m.plan_doc);
            const tasks = parsePlanTasks(m.tasks);
            const mod = {
                ...(idv ? { id: idv } : {}),
                ...(nv ? { name: nv } : {}),
                ...(stv ? { status: stv } : {}),
                ...(pv ? { priority: pv } : {}),
                ...(progressVal !== undefined ? { progress: progressVal } : {}),
                ...(ov ? { owner: ov } : {}),
                ...(uav ? { updatedAt: uav } : {}),
                ...(sv ? { summary: sv } : {}),
                ...(arv ? { archRef: arv } : {}),
                ...(mrv ? { modulesRef: mrv } : {}),
                ...(flowsVal.length > 0 ? { flows: flowsVal } : {}),
                ...(tasks.length > 0 ? { tasks } : {}),
                ...(pdv ? { planDoc: pdv } : {}),
            };
            return mod;
        });
        return {
            text,
            version: asString(parsed.version) ?? '1.0.0',
            updatedAt: asString(parsed.updated_at) ?? asString(parsed.updatedAt) ?? null,
            modules,
        };
    }
    catch {
        return { text, version: null, updatedAt: null, modules: [] };
    }
}
function cwdFor(ctx, sessionId) {
    return ctx.agents.get(sessionId)?.session.header.cwd;
}
function emptyBoard(cwd) {
    return ok({ cwd, diagramsDir: DIAGRAMS_DIR, diagrams: [], plan: null, generatedAt: null });
}
async function readBoard(ctx, sessionId) {
    const cwd = cwdFor(ctx, sessionId);
    if (cwd === undefined)
        return fail('internal', 'session has no working directory');
    try {
        const dir = await ctx.fs.resolve(DIAGRAMS_DIR, { cwd });
        const info = await ctx.fs.stat(dir);
        if (info === undefined)
            return emptyBoard(cwd);
        const entries = await ctx.fs.listDir(dir);
        const jsonFiles = entries.filter(e => e.type === 'file' && e.name.toLowerCase().endsWith('.json'));
        const diagrams = await Promise.all(jsonFiles
            .filter(e => e.name.toLowerCase() !== 'plan.json')
            .map(async (entry) => {
            const id = entry.name.replace(/\.json$/i, '');
            let specText = '';
            try {
                specText = await ctx.fs.readText(entry.target);
            }
            catch {
                specText = '';
            }
            const svgEntry = entries.find(e => e.type === 'file' && e.name.toLowerCase() === `${id}.svg`.toLowerCase());
            let svg = null;
            if (svgEntry) {
                try {
                    svg = await ctx.fs.readText(svgEntry.target);
                }
                catch {
                    svg = null;
                }
            }
            const { meta, title } = parseSpec(specText);
            let enrichedMeta = meta;
            const specAbsPath = pathJoin(cwd, DIAGRAMS_DIR, entry.name);
            if (!meta?.updatedAt || isDateOnly(meta.updatedAt)) {
                const mtime = await realMtime(specAbsPath);
                if (mtime && meta) {
                    enrichedMeta = { ...meta, updatedAt: mtime };
                }
                else if (!meta?.updatedAt && mtime && meta === null) {
                    enrichedMeta = { type: 'unknown', updatedAt: mtime };
                }
            }
            return {
                id,
                specText,
                meta: enrichedMeta,
                title: title || id,
                svg,
            };
        }));
        diagrams.sort((a, b) => {
            const ta = a.meta?.type ?? 'unknown';
            const tb = b.meta?.type ?? 'unknown';
            if (ta !== tb)
                return ta.localeCompare(tb);
            return a.id.localeCompare(b.id);
        });
        let plan = null;
        const planEntry = entries.find(e => e.type === 'file' && e.name.toLowerCase() === 'plan.json');
        if (planEntry) {
            const text = await ctx.fs.readText(planEntry.target);
            const parsed = parsePlan(text);
            const planAbsPath = pathJoin(cwd, DIAGRAMS_DIR, 'plan.json');
            const planMtime = await realMtime(planAbsPath);
            let planUpdatedAt = parsed.updatedAt;
            if ((!planUpdatedAt || isDateOnly(planUpdatedAt)) && planMtime) {
                planUpdatedAt = planMtime;
            }
            const modules = parsed.modules.map((mod) => {
                if (!mod.updatedAt || isDateOnly(mod.updatedAt)) {
                    return planMtime ? { ...mod, updatedAt: planMtime } : mod;
                }
                return mod;
            });
            plan = { ...parsed, updatedAt: planUpdatedAt, modules };
        }
        const generatedAt = diagrams
            .map(d => d.meta?.updatedAt ?? null)
            .find((v) => typeof v === 'string') ?? plan?.updatedAt ?? null;
        return ok({
            cwd,
            diagramsDir: DIAGRAMS_DIR,
            diagrams,
            plan,
            generatedAt,
        });
    }
    catch (error) {
        if (error instanceof Error && error.code === 'FS_NOT_FOUND') {
            return emptyBoard(cwd);
        }
        return fail('internal', error instanceof Error ? error.message : String(error));
    }
}
async function writeSpec(ctx, args) {
    const cwd = cwdFor(ctx, args.sessionId);
    if (cwd === undefined)
        return fail('internal', 'session has no working directory');
    const id = args.id.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!id)
        return fail('bad-request', 'invalid diagram id', { issues: [] });
    try {
        const target = await ctx.fs.resolve(`${DIAGRAMS_DIR}/${id}.json`, { cwd });
        await ctx.fs.writeText(target, args.text);
        return ok({ written: true });
    }
    catch (error) {
        return fail('internal', error instanceof Error ? error.message : String(error));
    }
}
async function writePlan(ctx, args) {
    const cwd = cwdFor(ctx, args.sessionId);
    if (cwd === undefined)
        return fail('internal', 'session has no working directory');
    try {
        const target = await ctx.fs.resolve(`${DIAGRAMS_DIR}/plan.json`, { cwd });
        await ctx.fs.writeText(target, args.text);
        return ok({ written: true });
    }
    catch (error) {
        return fail('internal', error instanceof Error ? error.message : String(error));
    }
}
const RENDER_REL = pathJoin('diagrams', 'archscribe', 'scripts', 'render_animated_diagram.py');
function resolveRenderScript() {
    const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
    const candidates = [
        pathJoin(home, '.agents', 'skills', 'dev-plan-assistant', RENDER_REL),
    ];
    for (const candidate of candidates) {
        try {
            if (existsSync(candidate))
                return candidate;
        }
        catch { /* ignore */ }
    }
    return null;
}
async function runRender(ctx, args) {
    const cwd = cwdFor(ctx, args.sessionId);
    if (cwd === undefined)
        return fail('internal', 'session has no working directory');
    const script = resolveRenderScript();
    if (script === null) {
        return fail('command-error', 'dev-plan-assistant render_animated_diagram.py not found on this host');
    }
    const diagramsAbs = pathJoin(cwd, DIAGRAMS_DIR);
    const board = await readBoard(ctx, args.sessionId);
    if (!board.ok)
        return board;
    const defaultTargets = board.value.diagrams
        .map(d => d.id)
        .filter(id => /^(architecture|modules|flow-.*|flow)$/.test(id));
    const targets = args.targets && args.targets.length > 0 ? args.targets : defaultTargets;
    const stdoutChunks = [];
    const stderrChunks = [];
    let lastExit = 0;
    let timedOut = false;
    for (const name of targets) {
        const safe = name.replace(/[^a-zA-Z0-9._-]/g, '');
        if (!safe)
            continue;
        const specPath = pathJoin(diagramsAbs, `${safe}.json`);
        const command = `python -X utf8 "${script}" --spec "${specPath}" --outdir "${diagramsAbs}" --basename "${safe}" --formats png,svg --style paper --check`;
        const shellSpec = ctx.shell.resolve({ command, workdir: cwd, timeoutMs: 120000 });
        const result = await ctx.shell.run(shellSpec);
        stdoutChunks.push(`### ${safe}\n${result.stdout}`);
        stderrChunks.push(`### ${safe}\n${result.stderr}`);
        if (result.timedOut)
            timedOut = true;
        if (result.exitCode === null || result.exitCode !== 0) {
            lastExit = result.exitCode ?? -1;
            break;
        }
    }
    const outcome = {
        exitCode: lastExit,
        stdout: stdoutChunks.join('\n'),
        stderr: stderrChunks.join('\n'),
        timedOut,
    };
    return ok(outcome);
}
export function apply(ctx) {
    ctx.inject(['connection'], (ready) => {
        const connection = ready.get('connection');
        const dispose = connection.rpc.handle(CHANNEL, async (endpoint, payload) => {
            try {
                if (endpoint === 'load') {
                    const { sessionId } = parseArgs(payload);
                    return await readBoard(ctx, sessionId);
                }
                if (endpoint === 'writeSpec') {
                    return await writeSpec(ctx, parseArgs(payload));
                }
                if (endpoint === 'writePlan') {
                    return await writePlan(ctx, parseArgs(payload));
                }
                if (endpoint === 'render') {
                    return await runRender(ctx, parseArgs(payload));
                }
                return { ok: false, error: { code: 'bad-request', message: `unknown method: ${endpoint}`, details: { issues: [] } } };
            }
            catch (error) {
                return { ok: false, error: { code: 'internal', message: error instanceof Error ? error.message : String(error), details: {} } };
            }
        }, { authority: 'trusted-host' });
        ctx.effect(() => () => { void dispose(); }, 'ui-design-center: rpc channel');
    });
}
export default { name: 'ui-design-center-host', apply, inject };
//# sourceMappingURL=index.js.map