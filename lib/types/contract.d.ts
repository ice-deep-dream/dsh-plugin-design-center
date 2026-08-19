/**
 * Wire contract shared between the host apply entry and the browser client.
 * Zero Node/browser runtime deps so either side may import the types.
 * @module @deepseek-ai/dsh-client-ui-design-center/contract
 */
export type DiagramType = 'architecture' | 'modules' | 'flow' | 'unknown';
/** A rendered diagram spec file paired with its SVG source. */
export interface DesignDiagram {
    /** Spec basename without extension, e.g. "architecture". */
    readonly id: string;
    /** Raw spec JSON text (meta + nodes + edges). */
    readonly specText: string;
    /** Parsed meta block, if present and parseable. */
    readonly meta: DesignDiagramMeta | null;
    /** Display title extracted from the spec (title.highlight / meta.name / id). */
    readonly title: string;
    /** Rendered SVG source, when available. */
    readonly svg: string | null;
}
/** The meta block of a diagram spec. */
export interface DesignDiagramMeta {
    readonly type?: DiagramType;
    readonly name?: string;
    readonly title?: string;
    readonly version?: string;
    readonly updatedAt?: string;
    readonly changes?: string;
    readonly status?: string;
    readonly accent?: string;
    readonly [key: string]: unknown;
}
/** A plan task item. */
export interface DesignPlanTask {
    readonly text: string;
    readonly done: boolean;
}
/** The plan.json document (modules array + free-form fields). */
export interface DesignPlan {
    /** Raw JSON text. */
    readonly text: string;
    /** Plan version (plan.json top-level). */
    readonly version: string | null;
    /** Plan-level updated_at. */
    readonly updatedAt: string | null;
    /** Parsed modules array, when present. */
    readonly modules: readonly DesignPlanModule[];
}
/** A single module row in plan.json. */
export interface DesignPlanModule {
    readonly id?: string;
    readonly name?: string;
    readonly status?: string;
    readonly priority?: string;
    readonly progress?: number;
    readonly owner?: string;
    readonly updatedAt?: string;
    readonly summary?: string;
    readonly archRef?: string;
    readonly modulesRef?: string;
    readonly flows?: readonly string[];
    readonly tasks?: readonly DesignPlanTask[];
    readonly planDoc?: string;
    readonly [key: string]: unknown;
}
/** Result of loading the whole board for a session. */
export interface DesignBoard {
    readonly cwd: string;
    readonly diagramsDir: string;
    readonly diagrams: readonly DesignDiagram[];
    readonly plan: DesignPlan | null;
    readonly generatedAt: string | null;
}
export interface DesignRenderOutcome {
    readonly exitCode: number;
    readonly stdout: string;
    readonly stderr: string;
    readonly timedOut: boolean;
}
export type DesignError = {
    code: 'internal';
    message: string;
    details: Record<string, never>;
} | {
    code: 'bad-request';
    message: string;
    details: {
        issues: readonly unknown[];
    };
} | {
    code: 'command-error';
    message: string;
    details: Record<string, never>;
} | {
    code: 'directory-unreadable';
    message: string;
    details: {
        path: string;
    };
};
export type DesignResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: DesignError;
};
//# sourceMappingURL=contract.d.ts.map