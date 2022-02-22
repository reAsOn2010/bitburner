import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = getHosts(ns)
    for (const h of hosts) {
        // ns.scriptKill("grow.js", h)
        // ns.scriptKill("hack.js", h)
        // ns.scriptKill("weaken.js", h)
        ns.scriptKill("agent.js", h)
        // ns.killall(h)
    }
}