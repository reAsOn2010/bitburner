import { runHWGW } from "./all.js"

/** @param {import("..").NS } ns */
export async function main(ns, ) {
    ns.scriptKill("hwgw.js", "home")
    runHWGW(ns)
}