import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
const CHANNEL = '/design-center';
function initialState() {
    return {
        status: 'idle',
        board: null,
        error: null,
        renderOutput: null,
        generation: 0,
        drafts: {},
        planDraft: null,
    };
}
function asDesignResult(result) {
    return result;
}
export class DesignCenterController {
    rpc;
    store;
    generation = 0;
    constructor(rpc) {
        this.rpc = rpc;
        this.store = createSnapshotStore(initialState(), { flush: 'raf' });
    }
    async call(endpoint, args) {
        const result = await this.rpc.call(CHANNEL, endpoint, { args });
        return asDesignResult(result);
    }
    async load(sessionId, force = false) {
        const generation = ++this.generation;
        if (!force) {
            this.store.update((d) => { d.status = 'loading'; d.error = null; });
        }
        try {
            const result = await this.call('load', { sessionId });
            if (generation !== this.generation)
                return;
            if (!result.ok) {
                this.store.update((d) => { d.status = 'error'; d.error = result.error.message; });
                return;
            }
            this.store.update((d) => {
                d.status = 'ready';
                d.board = result.value;
                d.error = null;
                d.drafts = {};
                d.planDraft = null;
            });
        }
        catch (error) {
            if (generation !== this.generation)
                return;
            this.store.update((d) => { d.status = 'error'; d.error = error instanceof Error ? error.message : String(error); });
        }
    }
    updateDraft(id, text) {
        this.store.update((d) => { d.drafts = { ...d.drafts, [id]: text }; });
    }
    clearDraft(id) {
        this.store.update((d) => {
            const { [id]: _removed, ...rest } = d.drafts;
            d.drafts = rest;
        });
    }
    async saveSpec(sessionId, id) {
        const text = this.store.getSnapshot().drafts[id];
        if (text === undefined)
            return false;
        try {
            const result = await this.call('writeSpec', { sessionId, id, text });
            if (!result.ok) {
                this.store.update((d) => { d.error = result.error.message; });
                return false;
            }
            this.clearDraft(id);
            return true;
        }
        catch (error) {
            this.store.update((d) => { d.error = error instanceof Error ? error.message : String(error); });
            return false;
        }
    }
    updatePlanDraft(text) {
        this.store.update((d) => { d.planDraft = text; });
    }
    clearPlanDraft() {
        this.store.update((d) => { d.planDraft = null; });
    }
    async savePlan(sessionId) {
        const text = this.store.getSnapshot().planDraft;
        if (text === null)
            return false;
        try {
            const result = await this.call('writePlan', { sessionId, text });
            if (!result.ok) {
                this.store.update((d) => { d.error = result.error.message; });
                return false;
            }
            this.clearPlanDraft();
            return true;
        }
        catch (error) {
            this.store.update((d) => { d.error = error instanceof Error ? error.message : String(error); });
            return false;
        }
    }
    async render(sessionId, targets) {
        const generation = ++this.generation;
        this.store.update((d) => { d.status = 'rendering'; d.error = null; d.renderOutput = null; });
        let result;
        try {
            result = await this.call('render', { sessionId, targets });
        }
        catch (error) {
            if (generation !== this.generation)
                return { ok: false, error: { code: 'internal', message: String(error), details: {} } };
            const message = error instanceof Error ? error.message : String(error);
            this.store.update((d) => { d.status = 'ready'; d.error = message; });
            return { ok: false, error: { code: 'internal', message, details: {} } };
        }
        if (generation !== this.generation)
            return result;
        this.store.update((d) => {
            d.status = 'ready';
            d.renderOutput = result.ok ? result.value : null;
            if (!result.ok)
                d.error = result.error.message;
            else if (result.value.exitCode !== 0)
                d.error = result.value.stderr || 'render command exited non-zero';
        });
        await this.load(sessionId, true);
        return result;
    }
}
//# sourceMappingURL=controller.js.map