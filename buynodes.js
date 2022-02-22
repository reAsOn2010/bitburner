import { buynodes } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    while (true) {
        buynodes(ns)
        await ns.sleep(500)
    }
}