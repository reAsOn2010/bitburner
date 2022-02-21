import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = getHosts(ns)
    let files = ns.ls("home", ".js")
    for (const h of hosts.filter(it => it != "home")) {
        await ns.scp(files, h)
    }
}