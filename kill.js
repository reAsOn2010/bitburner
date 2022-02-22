import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = getHosts(ns)
    for (const h of hosts) {
        // ns.scriptKill("grow.sh", h)
        // ns.scriptKill("hack.sh", h)
        // ns.scriptKill("weaken.sh", h)
        ns.scriptKill("agent.sh", h)
        // ns.killall(h)
    }
}