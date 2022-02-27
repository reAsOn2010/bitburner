import { buykubes } from "./lib.js"

/** @param {import(".").NS } ns */
export async function main(ns) {
    while (true) {
        ns.print("buy kubes...")
        buykubes(ns)
        await ns.sleep(60 * 1000)
    }
}