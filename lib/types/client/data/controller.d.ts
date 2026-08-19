/**
 * Design-center data controller: owns the snapshot store and mediates all
 * host RPC calls (load / writeSpec / writePlan / render). The view layer
 * subscribes via the store and triggers mutations through these methods.
 */
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client';
import { type SessionId, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { DesignBoard, DesignRenderOutcome, DesignResult } from '../../contract.ts';
type Status = 'idle' | 'loading' | 'ready' | 'error' | 'rendering';
export interface DesignCenterState {
    status: Status;
    board: DesignBoard | null;
    error: string | null;
    renderOutput: DesignRenderOutcome | null;
    generation: number;
    /** Dirty spec id -> edited text, for the inline editor. */
    drafts: Record<string, string>;
    /** Dirty plan text, when the plan tab is in edit mode. */
    planDraft: string | null;
}
export declare class DesignCenterController {
    private readonly rpc;
    readonly store: SnapshotStore<DesignCenterState>;
    private generation;
    constructor(rpc: ClientConnectionRpc);
    private call;
    load(sessionId: SessionId, force?: boolean): Promise<void>;
    updateDraft(id: string, text: string): void;
    clearDraft(id: string): void;
    saveSpec(sessionId: SessionId, id: string): Promise<boolean>;
    updatePlanDraft(text: string): void;
    clearPlanDraft(): void;
    savePlan(sessionId: SessionId): Promise<boolean>;
    render(sessionId: SessionId, targets?: readonly string[]): Promise<DesignResult<DesignRenderOutcome>>;
}
export {};
//# sourceMappingURL=controller.d.ts.map