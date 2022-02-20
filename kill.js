import * as lib from "./lib.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = lib.getHosts(ns)
    for (const h of hosts) {
        ns.killall(h)
    }
}