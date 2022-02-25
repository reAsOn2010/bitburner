import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    // let loop_time = 1200
    // let target = ""
    // let id = 0
    // while (true) {
    //     if (id % 600 == 0) {
    //         let tmp = getTarget(ns, loop_time)
    //         if (tmp != target) {
    //             target = tmp
    //             await prepare(ns, target)
    //         }
    //         let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    //         let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    //         ns.tprint(target, "|", money.toFixed(2), "|", security.toFixed(2))
    //     }
    //     HWGW(ns, target, id++, loop_time)
    //     await ns.sleep(loop_time)
    // }
    let scores = calScore(ns, 1200)
    scores.sort((a, b) => {
        if (a[1] > b[1]) return -1
        else if (a[1] < b[1]) return 1
        else return 0
    })
    ns.tprint(scores)
    let total_ram = getTotalRam() - 8
    while (total_ram > 0) {
        let host = 
        total_ram -= 
    }
}

import * as formula from "./formula.js";

function normalize(t) {
    return Math.ceil(t / 20) * 20
}

/** @param {import(".").NS } ns */
function getTotalRam(ns) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    let total_ram = 0
    for (const host of hosts) {
        total_ram += ns.getServerMaxRam(host)
    }
    return total_ram
}

/** @param {import(".").NS } ns */
function requestRam(ns, ram) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    for (const host of hosts) {
        if (ns.getServerMaxRam(host) - ns.getServerUsedRam(host) > ram) {
            return host
        }
    }
    return null
}

/** @param {import(".").NS } ns */
function getTarget(ns, loop_time) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    let target = ""
    let score = 0
    let total_ram = getTotalRam(ns)
    for (const host of hosts) {
        let tmp = calScore(ns, host, total_ram, loop_time)
        if (score < tmp) {
            target = host
            score = tmp
        }
    }
    return target
}

/** @param {import(".").NS } ns */
function calScore(ns, loop_time) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    let scores = []
    for (const host of hosts) {
        let server = ns.getServer(host)
        let player = ns.getPlayer()
        let t = calcGrowThreads(ns, host)
        let loop_ram = ns.getScriptRam("hack.js") + 2 * ns.getScriptRam("weaken.js") + t * ns.getScriptRam("grow.js")
        // let count = total_ram / cycle_ram
        let cycles_per_loop = Math.max(
            formula.growTime(ns, server, player),
            formula.hackTime(ns, server, player),
            formula.weakenTime(ns, server, player)
        ) / loop_time
        let score = ns.getServerMaxMoney(host) * formula.hackPercent(ns, server, player) * formula.hackChance(ns, server, player) * cycles_per_loop
        // ns.tprint(ns.getServerMaxMoney(host), "|", formula.hackPercent(ns, server, player), "|", formula.hackChance(ns, server, player))
        ns.tprint(host, "|", score, "|", cycles_per_loop, "|", loop_ram)
        scores.push([host, score, cycles_per_loop, loop_ram])
    }
    return scores
}

/** @param {import(".").NS } ns */
function calcGrowThreads(ns, target) {
    let player = ns.getPlayer()
    let server = ns.getServer(target)
    let t = 1
    for (t = 1; t < 100; t++) {
        if ((1-formula.hackPercent(ns, server, player)) * formula.growPercent(ns, server, t, player) >= 1) {
            break
        }
    }
    // ns.tprint(formula.growPercent(ns, server, t, player))
    // ns.tprint(formula.hackPercent(ns, server, player))
    return t
}

/** @param {import(".").NS } ns */
async function HWGW(ns, target, id, loop_time) {
    let hack_time = normalize(ns.getHackTime(target))
    let grow_time = normalize(ns.getGrowTime(target))
    let weaken_time = normalize(ns.getWeakenTime(target))
    let loop = Math.ceil(Math.max(hack_time, grow_time, weaken_time))

    let h_sleep = loop - hack_time + loop_time / 4 * 0
    let w1_sleep = loop - weaken_time + loop_time / 4
    let g_sleep = loop - grow_time + loop_time / 4 * 2
    let w2_sleep = loop - weaken_time + loop_time / 4 * 3

    let t = calcGrowThreads(ns, target)
    let cycle_ram = ns.getScriptRam("hack.js") + 2 * ns.getScriptRam("weaken.js") + t * ns.getScriptRam("grow.js")
    let host = requestRam(ns, cycle_ram)

    if (host == null) {
        return 
    }
    // let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    // let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    // ns.tprint(host, "|", target, "|", money.toFixed(2), "|", security.toFixed(2))
    
    ns.exec("hack.js", host, 1, target, h_sleep, id)
    ns.exec("weaken.js", host, 1, target, w1_sleep, id)
    ns.exec("grow.js", host, t, target, g_sleep, id)
    ns.exec("weaken.js", host, 1, target, w2_sleep, id)
    // await ns.sleep(loop + 700)

    // money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    // security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    // ns.tprint(host, "|", target, "|", money.toFixed(2), "|", security.toFixed(2))
    // return ts + 800
}

/** @param {import(".").NS } ns */
function printInfo(ns, host) {

    
    if (money < 100) {
        ns.exec("grow.js", "home", 500, host, 0)
    } else if (security > 100) {
        ns.exec("weaken.js", "home", 500, host, 0)
    }
}