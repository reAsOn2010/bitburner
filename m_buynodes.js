import { buynodes } from "./lib.js"

/** @param {import(".").NS } ns */
export async function main(ns) {
    while (true) {
        buynodes(ns)
        await ns.sleep(500)
    }
}