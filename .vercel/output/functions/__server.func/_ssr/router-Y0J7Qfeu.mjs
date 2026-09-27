import { i as __toESM } from "../_runtime.mjs";
import { _ as createFileRoute, b as useRouter, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, q as require_react, v as createRootRoute, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ArrowUpRight, i as Check, n as ShieldAlert, r as Copy, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Y0J7Qfeu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var profile = {
	handle: "MemecoinDev",
	name: "Mark",
	age: 41,
	place: "Georgia, USA",
	email: "memecoindev42@gmail.com",
	discord: "https://discord.gg/cx8UTEzv",
	x: [{
		handle: "Draco4226",
		href: "https://x.com/Draco4226"
	}, {
		handle: "Memecoindev46",
		href: "https://x.com/Memecoindev46"
	}]
};
var interests = [
	"Gamer",
	"Computer technician",
	"Car enthusiast",
	"Crypto lover",
	"Trader",
	"2A enthusiast",
	"Cleveland sports"
];
var rules = [
	{
		title: "No dev allocation",
		body: "I do not take a developer share of the supply."
	},
	{
		title: "No pre-mine",
		body: "Nothing is set aside before the coin is live."
	},
	{
		title: "No team allocation",
		body: "There is no team wallet. The team is me."
	},
	{
		title: "Buys are on-chain",
		body: "If I take any of a coin, that buy is live on chain where anyone can see it."
	}
];
var pumpCoins = [
	{
		name: "AnchorToken",
		href: "https://pump.fun/coin/3jhApg98ukHe2EZFDsZ92J2KhMuMY5CW3NpCdt5spump",
		address: "3jhApg98ukHe2EZFDsZ92J2KhMuMY5CW3NpCdt5spump",
		chain: "Solana",
		venue: "Pump.fun",
		action: "Open on Pump.fun"
	},
	{
		name: "CardinalTakeover",
		href: "https://pump.fun/coin/G46CBrcmCVmHuRwVa9KThGD1twdxxpYC2TPBVLg7pump",
		address: "G46CBrcmCVmHuRwVa9KThGD1twdxxpYC2TPBVLg7pump",
		chain: "Solana",
		venue: "Pump.fun",
		action: "Open on Pump.fun"
	},
	{
		name: "Guardians",
		href: "https://join.pump.fun/HSag/vkbmm9xh",
		chain: "Solana",
		venue: "Pump.fun",
		action: "Open join link",
		note: "Community join link. This is not the Gekko Guardians coin."
	}
];
var gekkoCoins = [
	{
		name: "Guardians",
		ticker: "$CHAMPS",
		href: "https://www.gekko.cash/coin/0x56c3fb3ab57ba2f6f69ab32cf5c1903ab300351f",
		address: "0x56c3fb3ab57ba2f6f69ab32cf5c1903ab300351f",
		chain: "Robinhood chain",
		venue: "Gekko.cash",
		action: "Open on Gekko",
		note: "Separate from the Pump.fun Guardians join link."
	},
	{
		name: "NoRugs",
		ticker: "$NORUGS",
		href: "https://www.gekko.cash/coin/0x7968f18863a24f0359851ac950e429de14546c18",
		address: "0x7968f18863a24f0359851ac950e429de14546c18",
		chain: "Robinhood chain",
		venue: "Gekko.cash",
		action: "Open on Gekko"
	},
	{
		name: "Cockroach Janta Party",
		ticker: "$ROACH",
		href: "https://www.gekko.cash/coin/0xe5c6bdaf6408b505aab1b65e9618a770a3b3c13a",
		address: "0xe5c6bdaf6408b505aab1b65e9618a770a3b3c13a",
		chain: "Robinhood chain",
		venue: "Gekko.cash",
		action: "Open on Gekko"
	},
	{
		name: "TheHinge",
		ticker: "$HINGE",
		href: "https://www.gekko.cash/coin/0x59fe54f9564285e33d0dd41d75c68ddc10e2e868",
		address: "0x59fe54f9564285e33d0dd41d75c68ddc10e2e868",
		chain: "Robinhood chain",
		venue: "Gekko.cash",
		action: "Open on Gekko"
	},
	{
		name: "Remember November / Polar Bear 2",
		ticker: "$REMEMBER",
		href: "https://www.gekko.cash/coin/0x8fbcf27a9da9ac2089b29260e65b2a7bf1bd203a",
		address: "0x8fbcf27a9da9ac2089b29260e65b2a7bf1bd203a",
		chain: "Robinhood chain",
		venue: "Gekko.cash",
		action: "Open on Gekko"
	}
];
var solscan = (address) => `https://solscan.io/account/${address}`;
var etherscan = (address) => `https://etherscan.io/address/${address}`;
var wallets = [
	{
		name: "Phantom",
		lines: [{
			chain: "SOL",
			address: "5LMbeHMUNGtpoy8cduZQ8rLNVuDWLj7iGXUsYQgdaztr",
			explorer: solscan("5LMbeHMUNGtpoy8cduZQ8rLNVuDWLj7iGXUsYQgdaztr")
		}]
	},
	{
		name: "Trust Wallet",
		lines: [{
			chain: "SOL",
			address: "HGdJzcJ9TBwZRNMdfFXmy1d7ZJ3v1181nsHY6D5DKZHa",
			explorer: solscan("HGdJzcJ9TBwZRNMdfFXmy1d7ZJ3v1181nsHY6D5DKZHa")
		}, {
			chain: "ETH",
			address: "0x4743Ff4b528A1861e26f4d6016b3EFB72e8C6Df3",
			explorer: etherscan("0x4743Ff4b528A1861e26f4d6016b3EFB72e8C6Df3")
		}]
	},
	{
		name: "Robinhood",
		detail: "Same address as the Gekko.cash account.",
		lines: [{
			chain: "EVM",
			address: "0x4743Ff4b528A1861e26f4d6016b3EFB72e8C6Df3"
		}]
	},
	{
		name: "Pump.fun · Draco4226",
		lines: [{
			chain: "SOL",
			address: "CzV52d371a6VRCkfV7jdPNtT5Tdkpty4Yn1pskCdk4Ki",
			explorer: solscan("CzV52d371a6VRCkfV7jdPNtT5Tdkpty4Yn1pskCdk4Ki")
		}, {
			chain: "EVM",
			address: "0x0f2F12CA9214d639B26Ca0cECD5251AFD2f3d267"
		}]
	},
	{
		name: "Pump.fun · Memecoindev42",
		lines: [{
			chain: "SOL",
			address: "CSxUFh1b9NZF791v5SnqUJCrNjZ5U9cMB5SD1MbTx9mT",
			explorer: solscan("CSxUFh1b9NZF791v5SnqUJCrNjZ5U9cMB5SD1MbTx9mT")
		}, {
			chain: "EVM",
			address: "0x8817fa56f077a041B8D94C258a9D7B33aACAc79a"
		}]
	}
];
var nav = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/pump",
		label: "Pump.fun"
	},
	{
		to: "/gekko",
		label: "Gekko.cash"
	}
];
function Shell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "group flex items-baseline gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl tracking-wide text-fg",
								children: "MEMECOINDEV"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden text-sm text-muted sm:inline",
								children: [profile.name, " · Georgia"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `mailto:${profile.email}`,
							className: "text-sm font-semibold text-gold hover:text-fg",
							children: "Email"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex gap-2",
						"aria-label": "Pages",
						children: nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							activeOptions: { exact: true },
							activeProps: { className: "inline-flex min-h-11 items-center border border-gold bg-gold px-4 text-sm font-semibold text-gold-ink" },
							inactiveProps: { className: "inline-flex min-h-11 items-center border border-line bg-surface px-4 text-sm font-semibold text-fg hover:border-gold" },
							children: item.label
						}, item.to))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-5xl flex-1 px-5 py-10",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "If it is not linked on this site, it is not me." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "X and Discord only. Telegram is a scammer." })]
				})
			})
		]
	});
}
function Kicker({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs font-semibold tracking-widest text-gold uppercase",
		children
	});
}
function SectionTitle({ kicker, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kicker, { children: kicker }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-4xl tracking-wide text-fg",
				children: title
			}),
			children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children
			}) : null
		]
	});
}
function TelegramCallout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "border border-copper bg-surface px-5 py-5 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
				className: "mt-0.5 size-5 shrink-0 text-copper",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-wide text-fg",
				children: "Telegram is not me"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "I am moving completely off Telegram. Scammers impersonate projects there, and Telegram has refused to help protect the groups. Anyone claiming to be me on Telegram is a scammer. I talk on X and Discord. Check this site or those accounts before you trust a message."
			})] })]
		})
	});
}
function CopyButton({ value, label = "Copy" }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "inline-flex min-h-11 items-center gap-2 border border-line bg-surface-2 px-4 text-sm font-semibold text-fg hover:border-gold",
		onClick: async () => {
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				window.setTimeout(() => setCopied(false), 1600);
			} catch {
				setCopied(false);
			}
		},
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-4 text-gold",
			"aria-hidden": "true"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
			className: "size-4",
			"aria-hidden": "true"
		}), copied ? "Copied" : label]
	});
}
function OutLink({ href, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: "inline-flex min-h-11 items-center gap-2 bg-gold px-4 text-sm font-semibold text-gold-ink hover:bg-fg",
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
			className: "size-4",
			"aria-hidden": "true"
		})]
	});
}
function CoinCard({ coin }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex flex-col border border-line bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 text-xs font-semibold tracking-widest uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-gold",
					children: coin.venue
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: coin.chain
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-4 font-display text-3xl tracking-wide text-fg",
				children: coin.name
			}),
			coin.ticker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-semibold text-gold",
				children: coin.ticker
			}) : null,
			coin.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: coin.note
			}) : null,
			coin.address ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-mono text-sm break-all text-fg",
				children: coin.address
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [coin.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutLink, {
					href: coin.href,
					children: coin.action
				}) : null, coin.address ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
					value: coin.address,
					label: "Copy address"
				}) : null]
			})
		]
	});
}
function WalletList({ groups }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "border border-line bg-surface",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-line px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl tracking-wide",
					children: group.name
				}), group.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: group.detail
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: group.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-gold uppercase",
						children: line.chain
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-sm break-all text-fg",
						children: line.address
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { value: line.address }), line.explorer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: line.explorer,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-semibold text-fg hover:border-gold",
						children: ["Explorer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
							className: "size-4",
							"aria-hidden": "true"
						})]
					}) : null]
				})]
			}, `${group.name}-${line.chain}-${line.address}`)) })]
		}, group.name))
	});
}
var styles_default = "/assets/styles-BnVpUk5u.css";
var APP_NAME = "MemecoinDev";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Official site for MemecoinDev. Mark's Pump.fun and Gekko.cash coins, wallets, and the only places he talks: X and Discord."
			},
			{
				name: "theme-color",
				content: "#12100c"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-BTL-WNK5.mjs");
var Route$2 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [{ title: "MemecoinDev · Official site" }] })
});
var $$splitComponentImporter$1 = () => import("./gekko-CSJXOjZU.mjs");
var Route$1 = createFileRoute("/gekko")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Gekko.cash coins · MemecoinDev" }] })
});
var $$splitComponentImporter = () => import("./pump-D7L5vyP0.mjs");
var Route = createFileRoute("/pump")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [{ title: "Pump.fun coins · MemecoinDev" }] })
});
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	GekkoRoute: Route$1.update({
		id: "/gekko",
		path: "/gekko",
		getParentRoute: () => Route$3
	}),
	PumpRoute: Route.update({
		id: "/pump",
		path: "/pump",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { SectionTitle as a, gekkoCoins as c, pumpCoins as d, rules as f, OutLink as i, interests as l, CoinCard as n, TelegramCallout as o, wallets as p, Kicker as r, WalletList as s, router_exports as t, profile as u };
