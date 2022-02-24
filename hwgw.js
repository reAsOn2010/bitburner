import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let target = getTarget(ns)
    await prepare(ns, target)
    let id = 0
    while (true) {
        if (id % 60 == 0) {
            let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
            let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
            ns.tprint(target, "|", money.toFixed(2), "|", security.toFixed(2))
        }
        HWGW(ns, target, id++)
        await ns.sleep(1200)
    }
}

import * as formula from "./formula.js";

function normalize(t) {
    return Math.ceil(t / 20) * 20
}

/** @param {import(".").NS } ns */
async function prepare(ns, target) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        for (const host of hosts) {
            let available_ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
            let t = Math.floor(available_ram / ns.getScriptRam("grow.js"))
            if (t > 0) {
                ns.exec("grow.js", host, t, target, Math.random() * 5000)
            }
        }
        ns.tprint("money", "|", ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target))
        await ns.sleep(60000)
    }
    
    while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        for (const host of hosts) {
            let available_ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
            let t = Math.floor(available_ram / ns.getScriptRam("weaken.js"))
            if (t > 0) {
                ns.exec("weaken.js", host, t, target, Math.random() * 5000)
            }
        }
        ns.tprint("security", "|", ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target))
        await ns.sleep(60000)
    }
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
function getTarget(ns) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    let target = ""
    let score = 0
    let total_ram = getTotalRam(ns)
    for (const host of hosts) {
        let tmp = calScore(ns, host, total_ram)
        if (score < tmp) {
            target = host
            score = tmp
        }
    }
    return target
}

/** @param {import(".").NS } ns */
function calScore(ns, host, total_ram) {
    let server = ns.getServer(host)
    let player = ns.getPlayer()
    let t = 1
    for (t = 1; t < 100; t++) {
        if (formula.growPercent(ns, server, t, player) >= formula.hackPercent(ns, server, player)) {
            break
        }
    }
    let cycle_ram = ns.getScriptRam("hack.js") + 2 * ns.getScriptRam("weaken.js") + t * ns.getScriptRam("grow.js")
    let count = total_ram / cycle_ram
    let cycle_time = Math.max(formula.growTime(ns, server, player), formula.hackTime(ns, server, player), formula.weakenTime(ns, server, player))
    let score = ns.getServerMaxMoney(host) * formula.hackPercent(ns, server, player) * formula.hackChance(ns, server, player) * Math.max(count, cycle_time)
    return score
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
async function HWGW(ns, target, id) {
    let hack_time = normalize(ns.getHackTime(target))
    let grow_time = normalize(ns.getGrowTime(target))
    let weaken_time = normalize(ns.getWeakenTime(target))
    let loop = Math.ceil(Math.max(hack_time, grow_time, weaken_time))

    let h_sleep = loop - hack_time
    let w1_sleep = loop + 300 - weaken_time
    let g_sleep = loop + 600 - grow_time
    let w2_sleep = loop + 900 - weaken_time

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