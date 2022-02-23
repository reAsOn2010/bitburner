import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let host = getHosts(ns.args[0])


}

function normalize(t) {
    return Math.ceil(t / 20) * 20
}

/** @param {import(".").NS } ns */
function HWGW(ns, host) {
    let hack_time = normalize(ns.getHackTime(host))
    let grow_time = normalize(ns.getGrowTime(host))
    let weaken_time = normalize(ns.getWeakenTime(host))
    let loop = Math.ceil(Math.max(hack_time, grow_time, weaken_time))
    let h_sleep = loop - hack_time
    let w1_sleep = loop + 200 - weaken_time
    let g_sleep = loop + 400 - grow_time
    let w2_sleep = loop + 600 - weaken_time
    ns.exec("hack.js", )
}