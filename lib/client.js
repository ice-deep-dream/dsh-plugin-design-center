window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-design-center",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperties(exports, {
			__esModule: { value: true },
			[Symbol.toStringTag]: { value: "Module" }
		});
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react = require("react");
		react = __toESM(react, 1);
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/data/controller.ts
		const CHANNEL = "/design-center";
		function initialState() {
			return {
				status: "idle",
				board: null,
				error: null,
				renderOutput: null,
				generation: 0,
				drafts: {},
				planDraft: null
			};
		}
		function asDesignResult(result) {
			return result;
		}
		var DesignCenterController = class {
			rpc;
			store;
			generation = 0;
			constructor(rpc) {
				this.rpc = rpc;
				this.store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(initialState(), { flush: "raf" });
			}
			async call(endpoint, args) {
				return asDesignResult(await this.rpc.call(CHANNEL, endpoint, { args }));
			}
			async load(sessionId, force = false) {
				const generation = ++this.generation;
				if (!force) this.store.update((d) => {
					d.status = "loading";
					d.error = null;
				});
				try {
					const result = await this.call("load", { sessionId });
					if (generation !== this.generation) return;
					if (!result.ok) {
						this.store.update((d) => {
							d.status = "error";
							d.error = result.error.message;
						});
						return;
					}
					this.store.update((d) => {
						d.status = "ready";
						d.board = result.value;
						d.error = null;
						d.drafts = {};
						d.planDraft = null;
					});
				} catch (error) {
					if (generation !== this.generation) return;
					this.store.update((d) => {
						d.status = "error";
						d.error = error instanceof Error ? error.message : String(error);
					});
				}
			}
			updateDraft(id, text) {
				this.store.update((d) => {
					d.drafts = {
						...d.drafts,
						[id]: text
					};
				});
			}
			clearDraft(id) {
				this.store.update((d) => {
					const { [id]: _removed, ...rest } = d.drafts;
					d.drafts = rest;
				});
			}
			async saveSpec(sessionId, id) {
				const text = this.store.getSnapshot().drafts[id];
				if (text === void 0) return false;
				try {
					const result = await this.call("writeSpec", {
						sessionId,
						id,
						text
					});
					if (!result.ok) {
						this.store.update((d) => {
							d.error = result.error.message;
						});
						return false;
					}
					this.clearDraft(id);
					return true;
				} catch (error) {
					this.store.update((d) => {
						d.error = error instanceof Error ? error.message : String(error);
					});
					return false;
				}
			}
			updatePlanDraft(text) {
				this.store.update((d) => {
					d.planDraft = text;
				});
			}
			clearPlanDraft() {
				this.store.update((d) => {
					d.planDraft = null;
				});
			}
			async savePlan(sessionId) {
				const text = this.store.getSnapshot().planDraft;
				if (text === null) return false;
				try {
					const result = await this.call("writePlan", {
						sessionId,
						text
					});
					if (!result.ok) {
						this.store.update((d) => {
							d.error = result.error.message;
						});
						return false;
					}
					this.clearPlanDraft();
					return true;
				} catch (error) {
					this.store.update((d) => {
						d.error = error instanceof Error ? error.message : String(error);
					});
					return false;
				}
			}
			async render(sessionId, targets) {
				const generation = ++this.generation;
				this.store.update((d) => {
					d.status = "rendering";
					d.error = null;
					d.renderOutput = null;
				});
				let result;
				try {
					result = await this.call("render", {
						sessionId,
						targets
					});
				} catch (error) {
					if (generation !== this.generation) return {
						ok: false,
						error: {
							code: "internal",
							message: String(error),
							details: {}
						}
					};
					const message = error instanceof Error ? error.message : String(error);
					this.store.update((d) => {
						d.status = "ready";
						d.error = message;
					});
					return {
						ok: false,
						error: {
							code: "internal",
							message,
							details: {}
						}
					};
				}
				if (generation !== this.generation) return result;
				this.store.update((d) => {
					d.status = "ready";
					d.renderOutput = result.ok ? result.value : null;
					if (!result.ok) d.error = result.error.message;
					else if (result.value.exitCode !== 0) d.error = result.value.stderr || "render command exited non-zero";
				});
				await this.load(sessionId, true);
				return result;
			}
		};
		//#endregion
		//#region \0dsh-css:C:\Users\Administrator\deepseek-harness\packages\client\ui-design-center\src\client\DesignCenterView.module.css.mjs
		const css = ".kqBgzW_designCenter{background:var(--dsw-alias-bg-layer-1);height:100%;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex;overflow:hidden}.kqBgzW_header{border-bottom:1px solid var(--dsw-alias-divider);background:var(--dsw-alias-bg-layer-1);flex:none;justify-content:space-between;align-items:center;gap:12px;padding:0 12px;display:flex}.kqBgzW_tabBar{align-items:stretch;gap:2px;min-width:0;display:flex}.kqBgzW_headerActions{flex:none;align-items:center;gap:8px;display:flex}.kqBgzW_tabButton{appearance:none;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-bottom:2px solid #0000;padding:8px 14px;font-size:12px;transition:color .15s,border-color .15s}.kqBgzW_tabButton:hover{color:var(--dsw-alias-label-primary)}.kqBgzW_tabButtonActive{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-accent,#2563eb)}.kqBgzW_content{flex-direction:column;flex:auto;gap:16px;padding:16px;display:flex;overflow:auto}.kqBgzW_diagramCard,.kqBgzW_planCard{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border);border-radius:10px;flex-direction:column;gap:10px;padding:14px;display:flex}.kqBgzW_diagramHeader{align-items:center;gap:8px;display:flex}.kqBgzW_diagramTitle{flex:none;margin-right:auto;font-size:14px;font-weight:600}.kqBgzW_planHeadTitle{color:var(--dsw-alias-label-secondary);margin-right:auto;font-size:13px;font-weight:600}.kqBgzW_editor{width:100%;min-height:220px;font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);resize:vertical;box-sizing:border-box;border-radius:6px;padding:10px;font-size:12px}.kqBgzW_editorActions{gap:8px;display:flex}.kqBgzW_svgWrap{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border);border-radius:8px;justify-content:center;padding:12px;display:flex;overflow:auto}.kqBgzW_svgImg{max-width:100%;height:auto;display:block}.kqBgzW_svgMissingHint{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-warning-subtle,#f59e0b1a);border-radius:6px;padding:6px 8px;font-size:12px}.kqBgzW_versionFooter{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border);border-left:3px solid #4d7c5a;border-radius:6px;flex-direction:column;gap:6px;padding:10px 12px;display:flex}.kqBgzW_versionLines{color:var(--dsw-alias-label-secondary);flex-wrap:wrap;align-items:center;gap:12px;font-size:12px;display:flex}.kqBgzW_ver{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border);border-radius:10px;padding:1px 8px;font-weight:600}.kqBgzW_verDate{color:var(--dsw-alias-label-tertiary)}.kqBgzW_verStatus{border-radius:10px;padding:1px 8px;font-size:11px}.kqBgzW_changes{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.55}.kqBgzW_flowLayout{grid-template-columns:260px 1fr;align-items:stretch;gap:14px;min-height:420px;display:grid}.kqBgzW_flowSide{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border);border-radius:10px;flex-direction:column;gap:6px;min-width:0;padding:10px;display:flex}.kqBgzW_flowSideHead{color:var(--dsw-alias-label-tertiary);border-bottom:1px dashed var(--dsw-alias-divider);margin-bottom:4px;padding:4px 6px 8px;font-size:12px;font-weight:600}.kqBgzW_flowSideList{flex-direction:column;gap:4px;display:flex;overflow:auto}.kqBgzW_flowMain{min-width:0;display:flex}.kqBgzW_flowMain>*{flex:auto;min-width:0}.kqBgzW_flowItem{appearance:none;text-align:left;cursor:pointer;color:var(--dsw-alias-label-primary);background:0 0;border:1px solid #0000;border-radius:8px;flex-direction:column;gap:4px;padding:8px 10px;transition:background .12s,border-color .12s;display:flex}.kqBgzW_flowItem:hover{background:var(--dsw-alias-bg-layer-1)}.kqBgzW_flowItemActive{background:var(--dsw-alias-bg-accent-subtle,#2563eb14);border-color:var(--dsw-alias-accent,#2563eb)}.kqBgzW_flowItemTitle{font-size:12px;font-weight:600}.kqBgzW_flowItemMeta{color:var(--dsw-alias-label-tertiary);gap:8px;font-size:11px;display:flex}.kqBgzW_planItem{appearance:none;text-align:left;cursor:pointer;color:var(--dsw-alias-label-primary);background:0 0;border:1px solid #0000;border-radius:8px;flex-direction:column;gap:6px;padding:8px 10px;transition:background .12s,border-color .12s;display:flex}.kqBgzW_planItem:hover{background:var(--dsw-alias-bg-layer-1)}.kqBgzW_planItemActive{background:var(--dsw-alias-bg-accent-subtle,#2563eb14);border-color:var(--dsw-alias-accent,#2563eb)}.kqBgzW_planItemTitle{font-size:12px;font-weight:600;line-height:1.35}.kqBgzW_planItemMeta{color:var(--dsw-alias-label-secondary);flex-wrap:wrap;align-items:center;gap:6px;font-size:11px;display:flex}.kqBgzW_planDot{border-radius:50%;width:8px;height:8px;display:inline-block}.kqBgzW_planItemProgress{align-items:center;gap:8px;display:flex}.kqBgzW_miniBar{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border);border-radius:2px;flex:auto;height:4px;overflow:hidden}.kqBgzW_miniFill{background:var(--dsw-alias-accent,#2563eb);border-radius:2px;height:100%;display:block}.kqBgzW_miniPct{color:var(--dsw-alias-label-tertiary);text-align:right;min-width:32px;font-size:11px}.kqBgzW_stPlanned{color:#6b6862;background:#e3e0d8}.kqBgzW_stProgress{color:#7a5416;background:#f0e2c2}.kqBgzW_stDone{color:#2f6b3f;background:#cfe3d4}.theme-dark .kqBgzW_stPlanned{color:#b9b3a7;background:#3a3833}.theme-dark .kqBgzW_stProgress{color:#f0d38c;background:#4a3a1e}.theme-dark .kqBgzW_stDone{color:#86c798;background:#26402c}.kqBgzW_planDot.kqBgzW_stPlanned{background:#b9b3a7}.kqBgzW_planDot.kqBgzW_stProgress{background:#d19b2c}.kqBgzW_planDot.kqBgzW_stDone{background:#4d7c5a}.kqBgzW_prioPill{letter-spacing:.3px;border-radius:8px;padding:1px 6px;font-size:10px;font-weight:700}.kqBgzW_prioP0{color:#8a2c4a;background:#e9c9d3}.kqBgzW_prioP1{color:#7a5416;background:#f0e2c2}.kqBgzW_prioP2{color:#6b6862;background:#e3e0d8}.kqBgzW_latestBadge,.kqBgzW_badgeLatest{color:#235088;background:#d8e6f5;border-radius:8px;padding:1px 6px;font-size:10px}.kqBgzW_planDetail{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border);border-radius:10px;flex-direction:column;gap:12px;padding:16px;display:flex}.kqBgzW_planDetailHead{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.kqBgzW_planDetailHead h3{margin:0;font-size:16px;font-weight:600}.kqBgzW_planBadges{flex-shrink:0;gap:6px;display:flex}.kqBgzW_badge{border-radius:10px;padding:2px 10px;font-size:11px;font-weight:600}.kqBgzW_planSummary{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.6}.kqBgzW_planLines{color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;gap:12px;font-size:12px;display:flex}.kqBgzW_prioTag{color:var(--dsw-alias-label-primary);font-weight:700}.kqBgzW_planDocHint{color:var(--dsw-alias-label-tertiary);font-style:italic}.kqBgzW_progressRow{align-items:center;gap:12px;display:flex}.kqBgzW_progressBar{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border);border-radius:4px;flex:auto;height:8px;overflow:hidden}.kqBgzW_progressFill{border-radius:4px;height:100%;transition:width .3s;display:block}.kqBgzW_progressFill.kqBgzW_stPlanned{background:#b9b3a7}.kqBgzW_progressFill.kqBgzW_stProgress{background:#d19b2c}.kqBgzW_progressFill.kqBgzW_stDone{background:#4d7c5a}.kqBgzW_progressPct{text-align:right;min-width:40px;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600}.kqBgzW_planBlock{flex-direction:column;gap:6px;display:flex}.kqBgzW_planBlock h4{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;font-weight:600}.kqBgzW_refChips{flex-wrap:wrap;gap:6px;display:flex}.kqBgzW_refChip{appearance:none;border:1px solid var(--dsw-alias-border);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:12px;padding:4px 10px;font-size:12px;transition:background .12s,border-color .12s}.kqBgzW_refChip:hover{border-color:var(--dsw-alias-accent,#2563eb)}.kqBgzW_refChipArch{border-color:#cdd9e8}.kqBgzW_refChipMod{border-color:#d6e3d3}.kqBgzW_refChipFlow{border-color:#e7d6c5}.kqBgzW_muted{color:var(--dsw-alias-label-tertiary);font-size:12px}.kqBgzW_tasks{flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;display:flex}.kqBgzW_tasks li{color:var(--dsw-alias-label-primary);align-items:flex-start;gap:8px;padding:4px 0;font-size:12px;display:flex}.kqBgzW_tasks li.kqBgzW_taskDone{color:var(--dsw-alias-label-tertiary)}.kqBgzW_tasks li.kqBgzW_taskDone span:last-child{text-decoration:line-through}.kqBgzW_tick{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border);width:16px;height:16px;color:var(--dsw-alias-label-secondary);border-radius:50%;flex-shrink:0;justify-content:center;align-items:center;font-size:10px;display:inline-flex}.kqBgzW_tasks li.kqBgzW_taskDone .kqBgzW_tick{color:#fff;background:#4d7c5a;border-color:#4d7c5a}.kqBgzW_statusBanner{border-radius:6px;align-items:center;gap:8px;padding:8px 12px;font-size:12px;display:flex}.kqBgzW_statusError{background:var(--dsw-alias-bg-danger-subtle,#ef44441a);color:var(--dsw-alias-label-danger,#dc2626)}.kqBgzW_statusInfo{background:var(--dsw-alias-bg-accent-subtle,#2563eb14);color:var(--dsw-alias-label-secondary)}.kqBgzW_empty{text-align:center;color:var(--dsw-alias-label-tertiary);flex-direction:column;justify-content:center;align-items:center;gap:8px;padding:48px 16px;display:flex}.kqBgzW_emptyTitle{color:var(--dsw-alias-label-secondary);font-size:14px;font-weight:600}.kqBgzW_emptyBody{max-width:360px;font-size:12px}.kqBgzW_renderLog{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border);font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);white-space:pre-wrap;max-height:240px;color:var(--dsw-alias-label-secondary);border-radius:6px;padding:8px;font-size:11px;overflow:auto}";
		const tagId = "@deepseek-ai/dsh-client-ui-design-center/DesignCenterView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-design-center";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var DesignCenterView_module_css_default = {
			"miniBar": "kqBgzW_miniBar",
			"muted": "kqBgzW_muted",
			"tick": "kqBgzW_tick",
			"designCenter": "kqBgzW_designCenter",
			"stDone": "kqBgzW_stDone",
			"planBlock": "kqBgzW_planBlock",
			"verDate": "kqBgzW_verDate",
			"flowMain": "kqBgzW_flowMain",
			"svgMissingHint": "kqBgzW_svgMissingHint",
			"planItemTitle": "kqBgzW_planItemTitle",
			"stProgress": "kqBgzW_stProgress",
			"refChips": "kqBgzW_refChips",
			"versionLines": "kqBgzW_versionLines",
			"editor": "kqBgzW_editor",
			"header": "kqBgzW_header",
			"stPlanned": "kqBgzW_stPlanned",
			"prioP2": "kqBgzW_prioP2",
			"refChipMod": "kqBgzW_refChipMod",
			"planHeadTitle": "kqBgzW_planHeadTitle",
			"flowItemActive": "kqBgzW_flowItemActive",
			"prioPill": "kqBgzW_prioPill",
			"planItemMeta": "kqBgzW_planItemMeta",
			"miniFill": "kqBgzW_miniFill",
			"headerActions": "kqBgzW_headerActions",
			"statusBanner": "kqBgzW_statusBanner",
			"refChip": "kqBgzW_refChip",
			"badge": "kqBgzW_badge",
			"editorActions": "kqBgzW_editorActions",
			"prioP1": "kqBgzW_prioP1",
			"progressPct": "kqBgzW_progressPct",
			"latestBadge": "kqBgzW_latestBadge",
			"refChipFlow": "kqBgzW_refChipFlow",
			"flowLayout": "kqBgzW_flowLayout",
			"planDetailHead": "kqBgzW_planDetailHead",
			"progressFill": "kqBgzW_progressFill",
			"tasks": "kqBgzW_tasks",
			"renderLog": "kqBgzW_renderLog",
			"planItemActive": "kqBgzW_planItemActive",
			"planDetail": "kqBgzW_planDetail",
			"planBadges": "kqBgzW_planBadges",
			"changes": "kqBgzW_changes",
			"tabButton": "kqBgzW_tabButton",
			"flowSideList": "kqBgzW_flowSideList",
			"content": "kqBgzW_content",
			"planItem": "kqBgzW_planItem",
			"flowItemTitle": "kqBgzW_flowItemTitle",
			"planSummary": "kqBgzW_planSummary",
			"versionFooter": "kqBgzW_versionFooter",
			"planDocHint": "kqBgzW_planDocHint",
			"taskDone": "kqBgzW_taskDone",
			"flowSideHead": "kqBgzW_flowSideHead",
			"miniPct": "kqBgzW_miniPct",
			"planCard": "kqBgzW_planCard",
			"flowItem": "kqBgzW_flowItem",
			"diagramTitle": "kqBgzW_diagramTitle",
			"verStatus": "kqBgzW_verStatus",
			"svgWrap": "kqBgzW_svgWrap",
			"progressBar": "kqBgzW_progressBar",
			"empty": "kqBgzW_empty",
			"badgeLatest": "kqBgzW_badgeLatest",
			"emptyTitle": "kqBgzW_emptyTitle",
			"ver": "kqBgzW_ver",
			"svgImg": "kqBgzW_svgImg",
			"flowSide": "kqBgzW_flowSide",
			"planItemProgress": "kqBgzW_planItemProgress",
			"diagramHeader": "kqBgzW_diagramHeader",
			"diagramCard": "kqBgzW_diagramCard",
			"refChipArch": "kqBgzW_refChipArch",
			"planDot": "kqBgzW_planDot",
			"statusError": "kqBgzW_statusError",
			"emptyBody": "kqBgzW_emptyBody",
			"statusInfo": "kqBgzW_statusInfo",
			"planLines": "kqBgzW_planLines",
			"progressRow": "kqBgzW_progressRow",
			"prioTag": "kqBgzW_prioTag",
			"prioP0": "kqBgzW_prioP0",
			"flowItemMeta": "kqBgzW_flowItemMeta",
			"tabBar": "kqBgzW_tabBar",
			"tabButtonActive": "kqBgzW_tabButtonActive"
		};
		//#endregion
		//#region src/client/DesignCenterView.tsx
		function svgDataUrl(svg) {
			return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
		}
		function pad2(n) {
			return n < 10 ? "0" + n : String(n);
		}
		function formatDateTime(value) {
			if (!value) return "";
			const trimmed = value.trim();
			if (!trimmed) return "";
			if (/^\d{4}[-/.]\d{2}[-/.]\d{2}[ T]\d{1,2}:\d{2}/.test(trimmed)) {
				const m = trimmed.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})[ T](\d{1,2}):(\d{2})/);
				if (m) return `${m[1]}-${m[2]}-${m[3]} ${pad2(Number(m[4]))}:${m[5]}`;
			}
			const parsed = new Date(trimmed);
			if (!Number.isNaN(parsed.getTime())) return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())} ${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
			return trimmed;
		}
		function diagramType(d) {
			return d.meta?.type ?? "unknown";
		}
		function findByType(diagrams, type) {
			return diagrams.find((d) => diagramType(d) === type);
		}
		function findFlows(diagrams) {
			return diagrams.filter((d) => diagramType(d) === "flow");
		}
		const STATUS_LABEL = {
			planned: "待开发",
			in_progress: "进行中",
			done: "已完成"
		};
		const STATUS_CLASS = {
			planned: "stPlanned",
			in_progress: "stProgress",
			done: "stDone"
		};
		function statusLabel(s) {
			if (!s) return "";
			return STATUS_LABEL[s] ?? s;
		}
		function statusClass(s) {
			if (!s) return DesignCenterView_module_css_default.stPlanned ?? "";
			const key = STATUS_CLASS[s];
			if (key === "stPlanned") return DesignCenterView_module_css_default.stPlanned ?? "";
			if (key === "stProgress") return DesignCenterView_module_css_default.stProgress ?? "";
			if (key === "stDone") return DesignCenterView_module_css_default.stDone ?? "";
			return DesignCenterView_module_css_default.stPlanned ?? "";
		}
		function DiagramVersionFooter(props) {
			const { diagram } = props;
			const m = diagram.meta;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DesignCenterView_module_css_default.versionFooter,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: DesignCenterView_module_css_default.versionLines,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: DesignCenterView_module_css_default.ver,
							children: ["v", m?.version ?? "1.0.0"]
						}),
						m?.updatedAt ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: DesignCenterView_module_css_default.verDate,
							children: ["更新于 ", formatDateTime(m.updatedAt)]
						}) : null,
						m?.status && m.status !== "stable" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${DesignCenterView_module_css_default.verStatus} ${statusClass(m.status)}`,
							children: m.status
						}) : null
					]
				}), m?.changes ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: DesignCenterView_module_css_default.changes,
					children: m.changes
				}) : null]
			});
		}
		function DiagramCard(props) {
			const { diagram, t, draft, onEdit, onSave, onCancel, showTitle = true } = props;
			const title = diagram.title || diagram.id;
			const editing = draft !== void 0;
			const svgMissing = diagram.svg === null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DesignCenterView_module_css_default.diagramCard,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.diagramHeader,
						children: [showTitle ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: DesignCenterView_module_css_default.diagramTitle,
							children: title
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), !editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onEdit(diagram.specText),
							children: t("toolbar.edit")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: DesignCenterView_module_css_default.editorActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "primary",
								onClick: onSave,
								children: t("toolbar.save")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								onClick: onCancel,
								children: t("toolbar.cancel")
							})]
						})]
					}),
					editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						className: DesignCenterView_module_css_default.editor,
						value: draft,
						onChange: (e) => onEdit(e.target.value),
						spellCheck: false
					}) : diagram.svg ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DesignCenterView_module_css_default.svgWrap,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							className: DesignCenterView_module_css_default.svgImg,
							src: svgDataUrl(diagram.svg),
							alt: title
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: DesignCenterView_module_css_default.renderLog,
						children: diagram.specText || "(empty spec)"
					}),
					svgMissing && !editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DesignCenterView_module_css_default.svgMissingHint,
						children: "未找到渲染后的 SVG（点击重新渲染）"
					}) : null,
					!editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiagramVersionFooter, { diagram }) : null
				]
			});
		}
		function FlowList(props) {
			const { flows, selectedId, onSelect } = props;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: DesignCenterView_module_css_default.flowSide,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: DesignCenterView_module_css_default.flowSideHead,
					children: [
						"业务流程（",
						flows.length,
						"）"
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: DesignCenterView_module_css_default.flowSideList,
					children: flows.map((f) => {
						const active = f.id === selectedId;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `${DesignCenterView_module_css_default.flowItem} ${active ? DesignCenterView_module_css_default.flowItemActive : ""}`,
							onClick: () => onSelect(f.id),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.flowItemTitle,
								children: f.title || f.id
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: DesignCenterView_module_css_default.flowItemMeta,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["v", f.meta?.version ?? "1.0.0"] }), f.meta?.updatedAt ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatDateTime(f.meta.updatedAt) }) : null]
							})]
						}, f.id);
					})
				})]
			});
		}
		function moduleProgress(m) {
			if (typeof m.progress === "number" && Number.isFinite(m.progress)) return Math.max(0, Math.min(100, Math.round(m.progress)));
			const tasks = m.tasks;
			if (tasks && tasks.length > 0) {
				const done = tasks.filter((t) => t.done).length;
				return Math.round(done * 100 / tasks.length);
			}
			return 0;
		}
		function PlanSideItem(props) {
			const { m, active, isLatest, onClick } = props;
			const pct = moduleProgress(m);
			const prio = (m.priority ?? "").toUpperCase();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `${DesignCenterView_module_css_default.planItem} ${active ? DesignCenterView_module_css_default.planItemActive : ""}`,
				onClick,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: DesignCenterView_module_css_default.planItemTitle,
						children: m.name ?? m.id ?? "(未命名)"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: DesignCenterView_module_css_default.planItemMeta,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${DesignCenterView_module_css_default.planDot} ${statusClass(m.status)}` }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLabel(m.status) || "—" }),
							prio ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${DesignCenterView_module_css_default.prioPill} ${DesignCenterView_module_css_default["prio" + prio]}`,
								children: prio
							}) : null,
							isLatest ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.latestBadge,
								children: "最新"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: DesignCenterView_module_css_default.planItemProgress,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: DesignCenterView_module_css_default.miniBar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.miniFill,
								style: { width: pct + "%" }
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: DesignCenterView_module_css_default.miniPct,
							children: [pct, "%"]
						})]
					})
				]
			});
		}
		function PlanDetail(props) {
			const { m, isLatest, diagramById, onJumpDiagram } = props;
			const pct = moduleProgress(m);
			const tasks = m.tasks ?? [];
			const doneTasks = tasks.filter((t) => t.done).length;
			const refs = [];
			const arch = m.archRef ? diagramById(m.archRef) : void 0;
			if (arch) refs.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `${DesignCenterView_module_css_default.refChip} ${DesignCenterView_module_css_default.refChipArch}`,
				onClick: () => onJumpDiagram(arch.id),
				children: ["架构图", arch.meta?.version ? ` · v${arch.meta.version}` : ""]
			}, "arch"));
			const mods = m.modulesRef ? diagramById(m.modulesRef) : void 0;
			if (mods) refs.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `${DesignCenterView_module_css_default.refChip} ${DesignCenterView_module_css_default.refChipMod}`,
				onClick: () => onJumpDiagram(mods.id),
				children: ["模块图", mods.meta?.version ? ` · v${mods.meta.version}` : ""]
			}, "mods"));
			for (const fid of m.flows ?? []) {
				const fl = diagramById(fid);
				refs.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `${DesignCenterView_module_css_default.refChip} ${DesignCenterView_module_css_default.refChipFlow}`,
					onClick: () => onJumpDiagram(fid),
					children: [
						"流程 · ",
						fl ? fl.title || fl.id : fid,
						fl?.meta?.version ? ` · v${fl.meta.version}` : ""
					]
				}, "f:" + fid));
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DesignCenterView_module_css_default.planDetail,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.planDetailHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: m.name ?? m.id ?? "(未命名)" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: DesignCenterView_module_css_default.planBadges,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${DesignCenterView_module_css_default.badge} ${statusClass(m.status)}`,
								children: statusLabel(m.status) || "待开发"
							}), isLatest ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.badgeLatest,
								children: "最新"
							}) : null]
						})]
					}),
					m.summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: DesignCenterView_module_css_default.planSummary,
						children: m.summary
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.planLines,
						children: [
							m.priority ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.prioTag,
								children: m.priority
							}) : null,
							m.updatedAt ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["更新于 ", formatDateTime(m.updatedAt)] }) : null,
							m.owner ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["负责人：", m.owner] }) : null,
							m.planDoc ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.planDocHint,
								title: m.planDoc,
								children: "明细计划待补"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.progressRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: DesignCenterView_module_css_default.progressBar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${DesignCenterView_module_css_default.progressFill} ${statusClass(m.status)}`,
								style: { width: pct + "%" }
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: DesignCenterView_module_css_default.progressPct,
							children: [pct, "%"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.planBlock,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: "关联图（架构 / 模块 / 流程对齐）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: DesignCenterView_module_css_default.refChips,
							children: refs.length > 0 ? refs : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DesignCenterView_module_css_default.muted,
								children: "无"
							})
						})]
					}),
					tasks.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.planBlock,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h4", { children: [
							"任务清单（",
							doneTasks,
							"/",
							tasks.length,
							"）"
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: DesignCenterView_module_css_default.tasks,
							children: tasks.map((t, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: t.done ? DesignCenterView_module_css_default.taskDone : "",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: DesignCenterView_module_css_default.tick,
									children: t.done ? "✓" : "○"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.text })]
							}, i))
						})]
					}) : null
				]
			});
		}
		function DesignCenterView(props) {
			const { controller, sessionId, useSessions, t } = props;
			const cwd = useSessions((list) => list.byId[sessionId]?.cwd);
			const state = (0, react.useSyncExternalStore)(controller.store.subscribe, () => controller.store.getSnapshot(), () => controller.store.getSnapshot());
			const [subTab, setSubTab] = (0, react.useState)("architecture");
			const [selectedFlow, setSelectedFlow] = (0, react.useState)(null);
			const [selectedModule, setSelectedModule] = (0, react.useState)(0);
			const [editingPlan, setEditingPlan] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (cwd) controller.load(sessionId);
			}, [
				controller,
				sessionId,
				cwd
			]);
			const board = state.board;
			const busy = state.status === "loading" || state.status === "rendering";
			const subTabs = (0, react.useMemo)(() => [
				{
					id: "architecture",
					label: t("tab.architecture")
				},
				{
					id: "modules",
					label: t("tab.modules")
				},
				{
					id: "flows",
					label: t("tab.flows")
				},
				{
					id: "plan",
					label: t("tab.plan")
				}
			], [t]);
			const flows = (0, react.useMemo)(() => board ? findFlows(board.diagrams) : [], [board]);
			const architecture = (0, react.useMemo)(() => board ? findByType(board.diagrams, "architecture") : void 0, [board]);
			const modules = (0, react.useMemo)(() => board ? findByType(board.diagrams, "modules") : void 0, [board]);
			(0, react.useEffect)(() => {
				if (flows.length === 0) {
					setSelectedFlow(null);
					return;
				}
				if (!selectedFlow || !flows.some((f) => f.id === selectedFlow)) {
					const first = flows[0];
					if (first) setSelectedFlow(first.id);
				}
			}, [flows, selectedFlow]);
			const planModules = board?.plan?.modules ?? [];
			(0, react.useEffect)(() => {
				if (selectedModule >= planModules.length) setSelectedModule(0);
			}, [planModules.length, selectedModule]);
			const latestModuleDate = (0, react.useMemo)(() => {
				let max = null;
				for (const m of planModules) {
					const d = m.updatedAt;
					if (d && (!max || d > max)) max = d;
				}
				return max;
			}, [planModules]);
			const diagramById = (id) => board?.diagrams.find((d) => d.id === id);
			const jumpToDiagram = (id) => {
				if (!board) return;
				const d = board.diagrams.find((x) => x.id === id);
				if (!d) return;
				const ty = diagramType(d);
				if (ty === "architecture") setSubTab("architecture");
				else if (ty === "modules") setSubTab("modules");
				else if (ty === "flow") {
					setSelectedFlow(d.id);
					setSubTab("flows");
				}
			};
			if (!cwd) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: DesignCenterView_module_css_default.designCenter,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: [DesignCenterView_module_css_default.statusBanner, DesignCenterView_module_css_default.statusInfo].filter(Boolean).join(" "),
					children: t("status.noCwd")
				})
			});
			const renderButton = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				size: "sm",
				variant: "primary",
				disabled: busy || !board,
				onClick: () => void controller.render(sessionId),
				children: state.status === "rendering" ? t("status.rendering") : t("toolbar.render")
			});
			const activeFlow = selectedFlow ? flows.find((f) => f.id === selectedFlow) : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DesignCenterView_module_css_default.designCenter,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: DesignCenterView_module_css_default.header,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DesignCenterView_module_css_default.tabBar,
						children: subTabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: [DesignCenterView_module_css_default.tabButton, tab.id === subTab && DesignCenterView_module_css_default.tabButtonActive].filter(Boolean).join(" "),
							onClick: () => setSubTab(tab.id),
							children: tab.label
						}, tab.id))
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: DesignCenterView_module_css_default.headerActions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "ghost",
							disabled: busy,
							onClick: () => void controller.load(sessionId, true),
							children: t("toolbar.refresh")
						}), renderButton]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: DesignCenterView_module_css_default.content,
					children: [
						state.error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: [DesignCenterView_module_css_default.statusBanner, DesignCenterView_module_css_default.statusError].filter(Boolean).join(" "),
							children: state.error
						}) : null,
						state.status === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: [DesignCenterView_module_css_default.statusBanner, DesignCenterView_module_css_default.statusInfo].filter(Boolean).join(" "),
							children: t("status.loading")
						}) : null,
						!board && state.status === "ready" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: DesignCenterView_module_css_default.empty,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: DesignCenterView_module_css_default.emptyTitle,
								children: t("empty.title")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: DesignCenterView_module_css_default.emptyBody,
								children: t("empty.body")
							})]
						}) : null,
						board && (subTab === "architecture" || subTab === "modules") ? (() => {
							const diagram = subTab === "architecture" ? architecture : modules;
							if (!diagram) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: DesignCenterView_module_css_default.empty,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: DesignCenterView_module_css_default.emptyTitle,
									children: t("empty.title")
								})
							});
							const draft = state.drafts[diagram.id];
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiagramCard, {
								diagram,
								t,
								draft,
								onEdit: (text) => controller.updateDraft(diagram.id, text),
								onSave: () => {
									controller.saveSpec(sessionId, diagram.id).then((ok) => {
										if (ok) return controller.load(sessionId, true);
									});
								},
								onCancel: () => controller.clearDraft(diagram.id)
							});
						})() : null,
						board && subTab === "flows" ? flows.length > 0 && activeFlow ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: DesignCenterView_module_css_default.flowLayout,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FlowList, {
								flows,
								selectedId: activeFlow.id,
								onSelect: setSelectedFlow
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: DesignCenterView_module_css_default.flowMain,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiagramCard, {
									diagram: activeFlow,
									t,
									draft: state.drafts[activeFlow.id],
									onEdit: (text) => controller.updateDraft(activeFlow.id, text),
									onSave: () => {
										controller.saveSpec(sessionId, activeFlow.id).then((ok) => {
											if (ok) return controller.load(sessionId, true);
										});
									},
									onCancel: () => controller.clearDraft(activeFlow.id),
									showTitle: false
								}, activeFlow.id)
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: DesignCenterView_module_css_default.empty,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: DesignCenterView_module_css_default.emptyTitle,
								children: "暂无业务流程图"
							})
						}) : null,
						board && subTab === "plan" ? (() => {
							const plan = board.plan;
							if (!plan) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: DesignCenterView_module_css_default.empty,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: DesignCenterView_module_css_default.emptyTitle,
									children: "plan.json not found"
								})
							});
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: DesignCenterView_module_css_default.planCard,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: DesignCenterView_module_css_default.diagramHeader,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: DesignCenterView_module_css_default.planHeadTitle,
										children: [
											"开发计划 · v",
											plan.version ?? "1.0.0",
											plan.updatedAt ? ` · 更新于 ${formatDateTime(plan.updatedAt)}` : ""
										]
									}), !editingPlan ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => {
											controller.updatePlanDraft(plan.text);
											setEditingPlan(true);
										},
										children: t("toolbar.edit")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: DesignCenterView_module_css_default.editorActions,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "primary",
											onClick: () => {
												controller.savePlan(sessionId).then((ok) => {
													if (ok) {
														setEditingPlan(false);
														return controller.load(sessionId, true);
													}
												});
											},
											children: t("toolbar.save")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => {
												controller.clearPlanDraft();
												setEditingPlan(false);
											},
											children: t("toolbar.cancel")
										})]
									})]
								}), editingPlan ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									className: DesignCenterView_module_css_default.editor,
									value: state.planDraft ?? plan.text,
									onChange: (e) => controller.updatePlanDraft(e.target.value),
									spellCheck: false
								}) : planModules.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: DesignCenterView_module_css_default.flowLayout,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
										className: DesignCenterView_module_css_default.flowSide,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: DesignCenterView_module_css_default.flowSideHead,
											children: [
												"计划模块（",
												planModules.length,
												"）"
											]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: DesignCenterView_module_css_default.flowSideList,
											children: planModules.map((m, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlanSideItem, {
												m,
												active: i === selectedModule,
												isLatest: !!m.updatedAt && m.updatedAt === latestModuleDate,
												onClick: () => setSelectedModule(i)
											}, m.id ?? String(i)))
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: DesignCenterView_module_css_default.flowMain,
										children: (() => {
											const sel = planModules[selectedModule];
											if (!sel) return null;
											return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlanDetail, {
												m: sel,
												isLatest: !!sel.updatedAt && sel.updatedAt === latestModuleDate,
												diagramById,
												onJumpDiagram: jumpToDiagram
											});
										})()
									})]
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: DesignCenterView_module_css_default.empty,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: DesignCenterView_module_css_default.emptyTitle,
										children: "plan.json 中还没有模块"
									})
								})]
							});
						})() : null,
						state.renderOutput ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: DesignCenterView_module_css_default.diagramCard,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: DesignCenterView_module_css_default.diagramHeader,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: DesignCenterView_module_css_default.diagramTitle,
										children: "Render output"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Pill, { children: ["exit ", state.renderOutput.exitCode] })]
								}),
								state.renderOutput.stdout ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: DesignCenterView_module_css_default.renderLog,
									children: state.renderOutput.stdout
								}) : null,
								state.renderOutput.stderr ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: DesignCenterView_module_css_default.renderLog,
									children: state.renderOutput.stderr
								}) : null
							]
						}) : null
					]
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** `designCenter` namespace dictionaries (view tab label + toolbar/empty strings). */
		/** Dictionary namespace owned by this plugin. */
		const NS = "designCenter";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"view.designCenter": "设计中心",
			"toolbar.refresh": "刷新",
			"toolbar.render": "重新渲染",
			"toolbar.edit": "编辑",
			"toolbar.save": "保存",
			"toolbar.cancel": "取消",
			"tab.architecture": "架构",
			"tab.modules": "模块",
			"tab.flows": "流程",
			"tab.plan": "计划",
			"empty.title": "暂无设计看板",
			"empty.body": "在工作区的 docs/design/diagrams 目录下生成架构图后，这里会显示看板内容。",
			"status.loading": "加载中…",
			"status.error": "加载失败",
			"status.rendering": "渲染中…",
			"status.saved": "已保存",
			"status.noCwd": "当前会话没有关联工作目录",
			"diagram.unnamed": "未命名图表",
			"plan.modules": "模块",
			"plan.status": "状态",
			"plan.priority": "优先级",
			"plan.progress": "进度"
		};
		/** English dictionary. */
		const en = {
			"view.designCenter": "Design Center",
			"toolbar.refresh": "Refresh",
			"toolbar.render": "Re-render",
			"toolbar.edit": "Edit",
			"toolbar.save": "Save",
			"toolbar.cancel": "Cancel",
			"tab.architecture": "Architecture",
			"tab.modules": "Modules",
			"tab.flows": "Flows",
			"tab.plan": "Plan",
			"empty.title": "No design board yet",
			"empty.body": "Once architecture diagrams are generated under docs/design/diagrams, the board appears here.",
			"status.loading": "Loading…",
			"status.error": "Load failed",
			"status.rendering": "Rendering…",
			"status.saved": "Saved",
			"status.noCwd": "This session has no working directory",
			"diagram.unnamed": "Untitled diagram",
			"plan.modules": "Modules",
			"plan.status": "Status",
			"plan.priority": "Priority",
			"plan.progress": "Progress"
		};
		//#endregion
		//#region src/client/index.ts
		/** Dependency injection slots consumed on the browser side. */
		const inject = [
			"slots",
			"sessions",
			"locale",
			"connection"
		];
		/**
		* Register the locale dictionaries, instantiate one controller per context,
		* and inject the design-center tab into the conversation.view list slot.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-design-center: dictionaries");
			const t = ctx.locale.bind(NS);
			const controller = new DesignCenterController(ctx.get("connection").rpc);
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "design-center",
				order: 20,
				locale: NS,
				label: () => t("view.designCenter"),
				inject: (_sessionId) => ({ controller })
			}, DesignCenterView));
		}
		var client_default = {
			name: "ui-design-center",
			apply,
			inject
		};
		//#endregion
		exports.apply = apply;
		exports.default = client_default;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map