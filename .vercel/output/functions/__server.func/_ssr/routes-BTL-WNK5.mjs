import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SectionTitle, c as gekkoCoins, d as pumpCoins, f as rules, i as OutLink, l as interests, o as TelegramCallout, p as wallets, r as Kicker, s as WalletList, u as profile } from "./router-Y0J7Qfeu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BTL-WNK5.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/mark.jpg",
					alt: "Mark, MemecoinDev",
					className: "aspect-square w-full border border-line object-cover",
					width: 512,
					height: 512
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
					className: "mt-3 text-sm text-muted",
					children: [
						profile.name,
						" · ",
						profile.age,
						" · ",
						profile.place
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kicker, { children: "Official dev account" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-6xl tracking-wide text-fg",
						children: profile.handle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-lg text-fg",
						children: "I build coin projects because I am sick of being rugged."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 max-w-xl text-muted",
						children: [
							"My name is ",
							profile.name,
							". I am ",
							profile.age,
							", from ",
							profile.place,
							". Gamer, computer technician, car enthusiast, crypto lover, trader, 2A enthusiast, and a Cleveland sports fan."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-5 flex flex-wrap gap-2",
						children: rules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border border-line bg-surface px-3 py-2 text-sm font-semibold text-fg",
							children: rule.title
						}, rule.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: [profile.x.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(OutLink, {
							href: account.href,
							children: ["@", account.handle]
						}, account.handle)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutLink, {
							href: profile.discord,
							children: "Discord"
						})]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramCallout, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				kicker: "The rules",
				title: "How these coins are launched",
				children: "No hidden bag. If I buy, it is a public on-chain buy after the coin is live."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-6 grid gap-px border border-line bg-line sm:grid-cols-2",
				children: rules.map((rule, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-xl tracking-wide text-gold",
							children: ["0", index + 1]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-display text-2xl tracking-wide",
							children: rule.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: rule.body
						})
					]
				}, rule.title))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					kicker: "Work with me",
					title: "X, Discord, or email",
					children: "That is the whole list. Collaborations go to the inbox below."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-4 sm:grid-cols-3",
					children: [profile.x.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: account.href,
						target: "_blank",
						rel: "noreferrer",
						className: "border border-line bg-surface p-5 hover:border-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-gold uppercase",
							children: "X"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-2xl tracking-wide",
							children: ["@", account.handle]
						})]
					}, account.handle)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: profile.discord,
						target: "_blank",
						rel: "noreferrer",
						className: "border border-line bg-surface p-5 hover:border-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-gold uppercase",
							children: "Discord"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl tracking-wide",
							children: "Join the server"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-muted",
					children: [
						"Email",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "font-semibold text-gold hover:text-fg",
							href: `mailto:${profile.email}`,
							children: profile.email
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 flex flex-wrap gap-2",
					children: interests.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "bg-surface-2 px-3 py-2 text-sm text-fg",
						children: item
					}, item))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				kicker: "Projects",
				title: "Where the coins live",
				children: "Two launchpads. Every contract on those pages is one I am willing to put my name on."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/pump",
					className: "border border-line bg-surface p-5 hover:border-gold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-gold uppercase",
							children: "Solana"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-display text-4xl tracking-wide",
							children: "Pump.fun"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-muted",
							children: pumpCoins.map((coin) => coin.name).join(" · ")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/gekko",
					className: "border border-line bg-surface p-5 hover:border-gold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-gold uppercase",
							children: "Robinhood chain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-display text-4xl tracking-wide",
							children: "Gekko.cash"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-muted",
							children: gekkoCoins.map((coin) => coin.name).join(" · ")
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "wallets",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					kicker: "Wallets",
					title: "Addresses I actually use",
					children: "Match these before you send anything. A similar address in a reply is not me."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletList, { groups: wallets })
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
