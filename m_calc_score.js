import { calcScore } from "./lib.js"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let scores = calcScore(ns)
    scores.sort((a, b) => {
        if (a[1] > b[1]) return -1
        else if (a[1] < b[1]) return 1
        else return 0
    })
    for (const i of scores) {
        ns.tprint(i)
    }
}