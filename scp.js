import * as lib from "./lib.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = lib.getHosts(ns)
    let files = ns.ls("home", ".js")
    for (const h of hosts) {
        await ns.scp(files, h)
    }
}