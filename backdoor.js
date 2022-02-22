import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = getHosts(ns)
    for (const h of hosts) {
        await ns.installBackdoor(h)
    }
}