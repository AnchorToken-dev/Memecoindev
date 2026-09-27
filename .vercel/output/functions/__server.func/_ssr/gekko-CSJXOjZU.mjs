import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SectionTitle, c as gekkoCoins, n as CoinCard, o as TelegramCallout } from "./router-Y0J7Qfeu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gekko-CSJXOjZU.js
var import_jsx_runtime = require_jsx_runtime();
function GekkoPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				kicker: "Robinhood chain",
				title: "Gekko.cash coins",
				children: "Same rules as Pump.fun. No dev allocation, no pre-mine, no team wallet. The team is me."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramCallout, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: gekkoCoins.map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinCard, { coin }, coin.name))
			})
		]
	});
}
//#endregion
export { GekkoPage as component };
