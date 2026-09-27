import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SectionTitle, d as pumpCoins, n as CoinCard, o as TelegramCallout } from "./router-Y0J7Qfeu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pump-D7L5vyP0.js
var import_jsx_runtime = require_jsx_runtime();
function PumpPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				kicker: "Solana",
				title: "Pump.fun coins",
				children: "Launched under MemecoinDev. No dev allocation, no pre-mine, no team wallet. If I buy, the buy is live on chain."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramCallout, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: pumpCoins.map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinCard, { coin }, coin.name))
			})
		]
	});
}
//#endregion
export { PumpPage as component };
