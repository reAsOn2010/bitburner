import { scpAll } from "./lib.js"

/** @param {import("..").NS } ns */
export async function main(ns) {
    await scpAll(ns)
}